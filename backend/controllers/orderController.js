const crypto = require("crypto");
const Coupon = require("../models/Coupon");
const Order = require("../models/Order");
const orderService = require("../services/orderService");
const paymentService = require("../services/paymentService");
const { calculateItemPricing } = require("../utils/priceCalculator");

function normalizeCouponCode(couponCode) {
  if (!couponCode) return "";
  if (typeof couponCode === "string") return couponCode.trim();
  if (typeof couponCode === "object" && couponCode.code) return String(couponCode.code).trim();
  return "";
}

// Same eligibility rules as couponController.validate — re-checked here so
// a coupon's new-user/product/occasion targeting can never be bypassed by
// skipping the /coupons/validate call and going straight to order creation.
async function isCouponEligible(coupon, { userId, items }) {
  if (coupon.isNewUserOnly) {
    const priorOrder = await Order.exists({ user: userId });
    if (priorOrder) return false;
  }

  if (Array.isArray(coupon.applicableProducts) && coupon.applicableProducts.length > 0) {
    const allowed = new Set(coupon.applicableProducts.map((p) => String(p)));
    const productIds = (items || []).map((i) => String(i._id || i.product || ""));
    if (productIds.length === 0 || !productIds.every((id) => allowed.has(id))) return false;
  }

  if (Array.isArray(coupon.applicableOccasions) && coupon.applicableOccasions.length > 0) {
    const allowed = new Set(coupon.applicableOccasions.map((o) => String(o)));
    const cartItems = items || [];
    const allMatch =
      cartItems.length > 0 &&
      cartItems.every((i) => (i.occasions || []).some((occ) => allowed.has(String(occ?._id || occ))));
    if (!allMatch) return false;
  }

  return true;
}

// POST /api/order/create
exports.createOrder = async (req, res) => {
  try {
    const { items, shippingAddress, paymentMethod = 'Online', couponCode: rawCouponCode } = req.body;
    const couponCode = normalizeCouponCode(rawCouponCode);
    const userId = req.user.id;

    // Same formula/rounding used everywhere else (cart, checkout, order
    // saving) — quantity only multiplies the price, tax/discount/shipping
    // are flat per line, so the coupon's "minOrderAmount" check and the
    // Razorpay amount always match what the user actually gets charged.
    const sampleTotal = items.reduce((sum, item) => {
      const pricing = calculateItemPricing({
        price: item.price,
        salePrice: item.salePrice,
        discount: item.discount,
        tax: item.tax,
        shippingCost: item.shippingCost,
        quantity: item.quantity,
      });
      return sum + pricing.itemTotal;
    }, 0);

    let totalAfterCoupon = sampleTotal;
    let finalDiscount = 0;

    if (couponCode) {
      const coupon = await Coupon.findOne({ code: couponCode.toUpperCase(), isActive: true });
      if (coupon) {
        // Re-validate on server
        const isExpiried = new Date() > new Date(coupon.expiryDate);
        const eligible = !isExpiried
          && coupon.usedCount < coupon.usageLimit
          && sampleTotal >= coupon.minOrderAmount
          && (await isCouponEligible(coupon, { userId, items }));
        if (eligible) {
          if (coupon.discountType === "percentage") {
            finalDiscount = (sampleTotal * coupon.discountValue) / 100;
            if (coupon.maxDiscount > 0 && finalDiscount > coupon.maxDiscount) {
              finalDiscount = coupon.maxDiscount;
            }
          } else {
            finalDiscount = coupon.discountValue;
          }
          totalAfterCoupon = Math.max(0, sampleTotal - finalDiscount);
        }
      }
    }

    let razorpayOrder = null;
    if (paymentMethod === 'Online') {
      razorpayOrder = await paymentService.createRazorpayOrder(totalAfterCoupon);
    }

    const newOrder = await orderService.createOrder({
      userId,
      items,
      shippingAddress,
      razorpayOrderId: razorpayOrder?.id,
      paymentMethod,
      couponCode: finalDiscount > 0 ? couponCode.toUpperCase() : null,
      discountAmount: finalDiscount
    });

    res.status(201).json({
      success: true,
      order: newOrder,
      razorpayOrder,
      razorpayKeyId: process.env.RAZORPAY_KEY_ID || null,
    });
  } catch (error) {
    console.error("Create Order Error:", error);
    res.status(error.statusCode || 500).json({ success: false, message: error.message || "Error creating order" });
  }
};

// POST /api/order/verify
exports.verifyPayment = async (req, res) => {
  try {
    const { razorpay_order_id, razorpay_payment_id, razorpay_signature } = req.body;

    if (!razorpay_order_id || !razorpay_payment_id || !razorpay_signature) {
      return res.status(400).json({ success: false, message: "Missing payment verification fields" });
    }

    const secret = process.env.RAZORPAY_KEY_SECRET;
    if (!secret) {
      console.error("Verify Payment Error: RAZORPAY_KEY_SECRET is not set");
      return res.status(500).json({ success: false, message: "Payment verification is not configured on server" });
    }

    const existingOrder = await Order.findOne({ razorpayOrderId: razorpay_order_id });
    if (existingOrder?.paymentStatus === "Success") {
      return res.json({
        success: true,
        message: "Payment already verified",
        orderId: existingOrder._id,
      });
    }

    const body = razorpay_order_id + "|" + razorpay_payment_id;
    const expectedSignature = crypto
      .createHmac("sha256", secret)
      .update(body.toString())
      .digest("hex");

    const isMatch = expectedSignature === razorpay_signature;

    if (isMatch) {
      const updatedOrder = await orderService.markPaymentSuccess(razorpay_order_id, razorpay_payment_id);
      if (!updatedOrder) {
        return res.status(404).json({
          success: false,
          message: "Order not found for this Razorpay payment",
        });
      }
      return res.json({
        success: true,
        message: "Payment verified successfully",
        orderId: updatedOrder._id,
      });
    }

    await orderService.markPaymentFailed(razorpay_order_id);
    return res.status(400).json({ success: false, message: "Invalid payment signature" });
  } catch (error) {
    console.error("Verify Payment Error:", error);
    res.status(500).json({ success: false, message: error.message || "Error verifying payment" });
  }
};

// GET /api/order/user
exports.getUserOrders = async (req, res) => {
  try {
    const orders = await orderService.getUserOrders(req.user.id);
    res.json(orders);
  } catch (error) {
    console.error("Get User Orders Error:", error);
    res.status(500).json({ success: false, message: "Error fetching user orders" });
  }
};

// DELETE /api/order/user/:id
exports.deleteUserOrder = async (req, res) => {
  try {
    await orderService.deleteUserOrder(req.user.id, req.params.id);
    res.json({ success: true, message: "Order deleted successfully" });
  } catch (error) {
    console.error("Delete User Order Error:", error);
    res.status(error.statusCode || 500).json({ success: false, message: error.message || "Error deleting order" });
  }
};

// GET /api/order/admin/all
exports.getAllOrders = async (req, res) => {
  try {
    const { page, limit, search } = req.query;
    const data = await orderService.getAllOrders({
      page: parseInt(page) || 1,
      limit: parseInt(limit) || 10,
      search: search || ""
    });
    res.json(data);
  } catch (error) {
    console.error("Get All Orders Error:", error);
    res.status(500).json({ success: false, message: "Error fetching orders" });
  }
};

// GET /api/order/admin/detail/:id
exports.getOrderById = async (req, res) => {
  try {
    const order = await orderService.getOrderById(req.params.id);
    if (!order) return res.status(404).json({ message: "Order not found" });
    res.json(order);
  } catch (error) {
    console.error("Get Order Detail Error:", error);
    res.status(500).json({ success: false, message: "Error fetching order detail" });
  }
};

// PUT /api/order/admin/:id/status
exports.updateOrderStatus = async (req, res) => {
  try {
    const { status } = req.body;
    await orderService.updateOrderStatus(req.params.id, status);
    res.json({ success: true, message: "Order status updated" });
  } catch (error) {
    console.error("Update Order Status Error:", error);
    res.status(500).json({ success: false, message: "Error updating order status" });
  }
};

// DELETE /api/order/admin/:id
exports.deleteOrder = async (req, res) => {
  try {
    await orderService.deleteOrder(req.params.id);
    res.json({ success: true, message: "Order deleted" });
  } catch (error) {
    console.error("Delete Order Error:", error);
    res.status(error.statusCode || 500).json({ success: false, message: error.message || "Error deleting order" });
  }
};

// POST /api/order/admin/bulk-delete
exports.deleteMultipleOrders = async (req, res) => {
  try {
    const { ids } = req.body;
    const result = await orderService.deleteMultipleOrders(ids);
    res.json({ success: true, message: `${result.deletedCount} orders deleted`, deletedCount: result.deletedCount });
  } catch (error) {
    console.error("Bulk Delete Order Error:", error);
    res.status(500).json({ success: false, message: error.message || "Error deleting orders" });
  }
};

// PUT /api/order/admin/:id/viewed
exports.markOrderAsViewed = async (req, res) => {
  try {
    await orderService.markOrderAsViewed(req.params.id);
    res.json({ success: true, message: "Order marked as viewed" });
  } catch (error) {
    console.error("Mark Order Viewed Error:", error);
    res.status(500).json({ success: false, message: "Error marking order as viewed" });
  }
};

// GET /api/order/admin/unviewed
exports.getUnviewedOrders = async (req, res) => {
  try {
    const orders = await orderService.getUnviewedOrders();
    res.json(orders);
  } catch (error) {
    console.error("Get Unviewed Orders Error:", error);
    res.status(500).json({ success: false, message: "Error fetching unviewed orders" });
  }
};

// GET /api/order/admin/payments
exports.getPaymentHistory = async (req, res) => {
  try {
    const payments = await paymentService.getPaymentHistory();
    res.json(payments);
  } catch (error) {
    console.error("Get Payment History Error:", error);
    res.status(500).json({ success: false, message: "Error fetching payments" });
  }
};

// GET /api/order/public/:token
exports.getPublicOrderByToken = async (req, res) => {
  try {
    const { token } = req.params;
    const order = await orderService.getPublicOrderByTrackingToken(token);
    if (!order) return res.status(404).json({ success: false, message: "Order not found" });
    res.json({ success: true, order });
  } catch (error) {
    console.error("Get Public Order Error:", error);
    res.status(500).json({ success: false, message: "Error fetching order" });
  }
};

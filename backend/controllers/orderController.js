const crypto = require("crypto");
const Coupon = require("../models/Coupon");
const orderService = require("../services/orderService");
const paymentService = require("../services/paymentService");

// POST /api/order/create
exports.createOrder = async (req, res) => {
  try {
    const { items, shippingAddress, paymentMethod = 'Online', couponCode } = req.body;
    const userId = req.user.id;

    const sampleTotal = items.reduce((sum, item) => {
      const quantity = Number(item.quantity || 1);
      const salePrice = item.salePrice !== undefined && item.salePrice !== null ? Number(item.salePrice) : Number(item.price || 0);
      const discount = Number(item.discount || 0);
      const tax = Number(item.tax || 0);
      const shippingCost = Number(item.shippingCost || 0);
      const discountedPrice = salePrice * (1 - discount / 100);
      const taxedPrice = discountedPrice * (1 + tax / 100);
      return sum + (taxedPrice + shippingCost) * quantity;
    }, 0);

    let totalAfterCoupon = sampleTotal;
    let finalDiscount = 0;

    if (couponCode) {
      const coupon = await Coupon.findOne({ code: couponCode.toUpperCase(), isActive: true });
      if (coupon) {
        // Re-validate on server
        const isExpiried = new Date() > new Date(coupon.expiryDate);
        if (!isExpiried && coupon.usedCount < coupon.usageLimit && sampleTotal >= coupon.minOrderAmount) {
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

    const body = razorpay_order_id + "|" + razorpay_payment_id;
    const expectedSignature = crypto
      .createHmac("sha256", process.env.RAZORPAY_KEY_SECRET)
      .update(body.toString())
      .digest("hex");

    const isMatch = expectedSignature === razorpay_signature;

    if (isMatch) {
      await orderService.markPaymentSuccess(razorpay_order_id, razorpay_payment_id);
      res.json({ success: true, message: "Payment verified successfully" });
    } else {
      await orderService.markPaymentFailed(razorpay_order_id);
      res.status(400).json({ success: false, message: "Invalid signature" });
    }
  } catch (error) {
    console.error("Verify Payment Error:", error);
    res.status(500).json({ success: false, message: "Error verifying payment" });
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

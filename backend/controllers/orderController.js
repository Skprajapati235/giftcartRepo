const crypto = require("crypto");
const orderService = require("../services/orderService");
const paymentService = require("../services/paymentService");

// POST /api/order/create
exports.createOrder = async (req, res) => {
  try {
    const { items, totalAmount, shippingAddress } = req.body;
    const userId = req.user.id;

    // 1. Create Razorpay order
    const razorpayOrder = await paymentService.createRazorpayOrder(totalAmount);

    // 2. Save order in DB via service
    const newOrder = await orderService.createOrder({
      userId,
      items,
      totalAmount,
      shippingAddress,
      razorpayOrderId: razorpayOrder.id,
    });

    res.status(201).json({
      success: true,
      order: newOrder,
      razorpayOrder,
    });
  } catch (error) {
    console.error("Create Order Error:", error);
    res.status(500).json({ success: false, message: "Error creating order" });
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
    const orders = await orderService.getAllOrders();
    res.json(orders);
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

const Order = require("../models/Order");

// Create a new order record in DB
exports.createOrder = async ({ userId, items, totalAmount, shippingAddress, razorpayOrderId }) => {
  const order = new Order({
    user: userId,
    items: items.map((item) => ({
      product: item._id,
      name: item.name,
      quantity: item.quantity || 1,
      price: item.price,
    })),
    totalAmount,
    shippingAddress,
    razorpayOrderId,
    status: "Pending",
    paymentStatus: "Pending",
  });
  return await order.save();
};

// Update order after payment verification
exports.markPaymentSuccess = async (razorpayOrderId, razorpayPaymentId) => {
  return await Order.findOneAndUpdate(
    { razorpayOrderId },
    {
      razorpayPaymentId,
      paymentStatus: "Success",
      status: "Processing",
    },
    { new: true }
  );
};

// Mark payment as failed
exports.markPaymentFailed = async (razorpayOrderId) => {
  return await Order.findOneAndUpdate(
    { razorpayOrderId },
    { paymentStatus: "Failed" },
    { new: true }
  );
};

// Get all orders for a specific user
exports.getUserOrders = async (userId) => {
  return await Order.find({ user: userId }).sort("-createdAt");
};

// ─── ADMIN ──────────────────────────────────────────────

// Get all orders (admin)
exports.getAllOrders = async () => {
  return await Order.find()
    .populate("user", "name email")
    .sort("-createdAt");
};

// Get single order detail by ID (admin)
exports.getOrderById = async (id) => {
  return await Order.findById(id)
    .populate("user", "name email phone")
    .populate("items.product", "image name");
};

// Update order status (admin)
exports.updateOrderStatus = async (id, status) => {
  return await Order.findByIdAndUpdate(id, { status }, { new: true });
};

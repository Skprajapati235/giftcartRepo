const Order = require("../models/Order");
const Coupon = require("../models/Coupon");
const emailService = require("../utils/emailService");
const User = require("../models/User");

// Create a new order record in DB
exports.createOrder = async ({ userId, items, shippingAddress, razorpayOrderId, paymentMethod = 'Online', couponCode, discountAmount = 0 }) => {
  const processedItems = items.map((item) => {
    const quantity = Number(item.quantity || 1);
    const price = Number(item.price || 0);
    const salePrice = item.salePrice !== undefined && item.salePrice !== null ? Number(item.salePrice) : price;
    const discount = Number(item.discount || 0);
    const tax = Number(item.tax || 0);
    const shippingCost = Number(item.shippingCost || 0);
    const discountedPrice = salePrice * (1 - discount / 100);
    const taxedPrice = discountedPrice * (1 + tax / 100);
    const itemTotal = Number(((taxedPrice + shippingCost) * quantity).toFixed(2));

    return {
      product: item._id,
      name: item.name,
      quantity,
      price,
      salePrice,
      shippingCost,
      discount,
      tax,
      itemTotal,
    };
  });

  if (paymentMethod === 'COD') {
    const nonCodItem = items.find((item) => item.isCodAvailable === false || item.isCodAvailable === 'false');
    if (nonCodItem) {
      const error = new Error('COD is not available for one or more items in your cart.');
      error.statusCode = 400;
      throw error;
    }
  }

  const calculatedTotal = processedItems.reduce((sum, item) => sum + item.itemTotal, 0);
  const finalTotal = Number((calculatedTotal - discountAmount).toFixed(2));

  const order = new Order({
    user: userId,
    items: processedItems,
    totalAmount: finalTotal,
    shippingAddress,
    razorpayOrderId,
    paymentMethod,
    status: 'Pending',
    paymentStatus: 'Pending',
    couponCode,
    discountAmount
  });

  const savedOrder = await order.save();
  
  if (couponCode) {
    await Coupon.findOneAndUpdate({ code: couponCode }, { $inc: { usedCount: 1 } });
  }

  // If COD, send email notification immediately
  if (paymentMethod === 'COD') {
    const user = await User.findById(userId);
    if (user) {
      emailService.sendOrderNotification(savedOrder, user);
    }
  }

  return savedOrder;
};

// Update order after payment verification
exports.markPaymentSuccess = async (razorpayOrderId, razorpayPaymentId) => {
  const updatedOrder = await Order.findOneAndUpdate(
    { razorpayOrderId },
    {
      razorpayPaymentId,
      paymentStatus: "Success",
      status: "Processing",
    },
    { new: true }
  ).populate("user");

  if (updatedOrder) {
    emailService.sendOrderNotification(updatedOrder, updatedOrder.user);
  }

  return updatedOrder;
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
  return await Order.find({ user: userId })
    .populate("items.product", "image name salePrice price")
    .sort("-createdAt");
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
    .populate("items.product", "image name salePrice price");
};

// Update order status (admin)
exports.updateOrderStatus = async (id, status) => {
  return await Order.findByIdAndUpdate(id, { status }, { new: true });
};

// Mark order as viewed by admin
exports.markOrderAsViewed = async (id) => {
  return await Order.findByIdAndUpdate(id, { isAdminViewed: true }, { new: true });
};

// Get unviewed orders (for alerts)
exports.getUnviewedOrders = async () => {
    return await Order.find({ isAdminViewed: false, $or: [{ paymentMethod: 'COD' }, { paymentStatus: 'Success' }] })
      .populate("user", "name email");
};

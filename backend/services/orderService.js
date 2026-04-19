const Order = require("../models/Order");
const Coupon = require("../models/Coupon");
const emailService = require("../utils/emailService");
const User = require("../models/User");
const crypto = require("crypto");
const whatsappService = require("../utils/whatsappService");

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
      deliveryTime: item.deliveryTime,
      expectedDeliveryDate: item.expectedDeliveryDate,
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
    trackingToken: crypto.randomBytes(16).toString("hex"),
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

  // WhatsApp: order placed (Pending)
  try {
    const user = await User.findById(userId);
    const toList = [user?.mobileNumber, savedOrder?.shippingAddress?.phone].filter(Boolean);
    await whatsappService.sendWhatsAppMessageToMany({
      toList,
      body: whatsappService.formatOrderUpdateMessage({
        order: savedOrder,
        statusOverride: "Pending",
      }),
    });
  } catch (err) {
    console.warn("[whatsapp] order placed send failed:", err?.message || err);
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
      processingAt: Date.now(),
    },
    { new: true }
  ).populate("user");

  if (updatedOrder) {
    emailService.sendOrderNotification(updatedOrder, updatedOrder.user);

    // WhatsApp: order confirmed/processing
    try {
      const toList = [
        updatedOrder?.user?.mobileNumber,
        updatedOrder?.shippingAddress?.phone,
      ].filter(Boolean);
      await whatsappService.sendWhatsAppMessageToMany({
        toList,
        body: whatsappService.formatOrderUpdateMessage({
          order: updatedOrder,
          statusOverride: "Processing",
        }),
      });
    } catch (err) {
      console.warn("[whatsapp] order processing send failed:", err?.message || err);
    }
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
exports.getAllOrders = async ({ page = 1, limit = 10, search = "" } = {}) => {
  const skip = (page - 1) * limit;
  let query = {};

  if (search) {
     // Check if search is a valid ObjectId (Order ID)
     const mongoose = require("mongoose");
     const isObjectId = mongoose.Types.ObjectId.isValid(search);
     
     if (isObjectId) {
       query = { _id: search };
     } else {
       // Search in user details (needs populate or aggregation, but simpler to search in populated fields if possible)
       // For simplicity, we'll try to find users first or use aggregation
       const users = await User.find({
         $or: [
           { name: { $regex: search, $options: "i" } },
           { email: { $regex: search, $options: "i" } }
         ]
       }).select('_id');
       
       query = { user: { $in: users.map(u => u._id) } };
     }
  }

  const orders = await Order.find(query)
    .populate("user", "name email")
    .sort("-createdAt")
    .skip(skip)
    .limit(limit);

  const total = await Order.countDocuments(query);

  return {
    data: orders,
    total,
    page: Number(page),
    totalPages: Math.ceil(total / limit),
  };
};

// Get single order detail by ID (admin)
exports.getOrderById = async (id) => {
  return await Order.findById(id)
    .populate("user", "name email mobileNumber")
    .populate("items.product", "image name salePrice price");
};

// Public: fetch limited order info by tracking token
exports.getPublicOrderByTrackingToken = async (trackingToken) => {
  if (!trackingToken) return null;

  const order = await Order.findOne({ trackingToken })
    .populate("items.product", "image name salePrice price")
    .select(
      "trackingToken status paymentMethod paymentStatus totalAmount shippingAddress items processingAt shippedAt deliveredAt cancelledAt createdAt updatedAt"
    );

  if (!order) return null;

  // Reduce shipping fields to safe subset (no full address)
  const safeShipping = {
    fullName: order.shippingAddress?.fullName,
    phone: order.shippingAddress?.phone,
    pinCode: order.shippingAddress?.pinCode,
    landmark: order.shippingAddress?.landmark,
  };

  return {
    _id: order._id,
    trackingToken: order.trackingToken,
    status: order.status,
    paymentMethod: order.paymentMethod,
    paymentStatus: order.paymentStatus,
    totalAmount: order.totalAmount,
    shippingAddress: safeShipping,
    items: order.items,
    processingAt: order.processingAt,
    shippedAt: order.shippedAt,
    deliveredAt: order.deliveredAt,
    cancelledAt: order.cancelledAt,
    createdAt: order.createdAt,
    updatedAt: order.updatedAt,
  };
};

// Update order status (admin)
exports.updateOrderStatus = async (id, status) => {
  const updateData = { status };
  
  if (status === "Processing") updateData.processingAt = Date.now();
  if (status === "Shipped") updateData.shippedAt = Date.now();
  if (status === "Delivered") updateData.deliveredAt = Date.now();
  if (status === "Cancelled") updateData.cancelledAt = Date.now();

  const updated = await Order.findByIdAndUpdate(id, updateData, { new: true }).populate("user");

  if (updated) {
    try {
      const toList = [updated?.user?.mobileNumber, updated?.shippingAddress?.phone].filter(Boolean);
      await whatsappService.sendWhatsAppMessageToMany({
        toList,
        body: whatsappService.formatOrderUpdateMessage({
          order: updated,
          statusOverride: status,
        }),
      });
    } catch (err) {
      console.warn("[whatsapp] order status send failed:", err?.message || err);
    }
  }

  return updated;
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

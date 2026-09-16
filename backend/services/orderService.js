// const Order = require("../models/Order");
// const Coupon = require("../models/Coupon");
// const emailService = require("../utils/emailService");
// const User = require("../models/User");
// const crypto = require("crypto");
// const whatsappService = require("../utils/whatsappService");

// async function appendWhatsAppLogs(orderId, event, results) {
//   if (!orderId || !Array.isArray(results) || results.length === 0) return;
//   const logs = results.map((r) => ({
//     event,
//     to: r?.to,
//     sid: r?.sid,
//     success: Boolean(r?.success),
//     skipped: Boolean(r?.skipped),
//     reason: r?.reason,
//     error: r?.error
//       ? {
//           status: r.error.status != null ? Number(r.error.status) : undefined,
//           code: r.error.code != null ? Number(r.error.code) : undefined,
//           message: r.error.message ? String(r.error.message) : undefined,
//           moreInfo: r.error.moreInfo ? String(r.error.moreInfo) : undefined,
//         }
//       : undefined,
//     createdAt: new Date(),
//   }));
//   await Order.findByIdAndUpdate(orderId, { $push: { whatsappLogs: { $each: logs } } });
// }

// async function sendPostPaymentNotifications(updatedOrder) {
//   try {
//     await emailService.sendOrderNotification(updatedOrder, updatedOrder.user);
//   } catch (err) {
//     console.warn("[email] order notification failed:", err?.message || err);
//   }

//   try {
//     const toList = [
//       updatedOrder?.user?.mobileNumber,
//       updatedOrder?.shippingAddress?.phone,
//     ].filter(Boolean);
//     const results = await whatsappService.sendWhatsAppMessageToMany({
//       toList,
//       body: whatsappService.formatOrderUpdateMessage({
//         order: updatedOrder,
//         statusOverride: "Processing",
//       }),
//     });
//     await appendWhatsAppLogs(updatedOrder._id, "order_processing", results);
//   } catch (err) {
//     console.warn("[whatsapp] order processing send failed:", err?.message || err);
//   }
// }

// // Create a new order record in DB
// exports.createOrder = async ({ userId, items, shippingAddress, razorpayOrderId, paymentMethod = 'Online', couponCode, discountAmount = 0 }) => {
//   const processedItems = items.map((item) => {
//     const quantity = Number(item.quantity || 1);
//     const price = Number(item.price || 0);
//     const salePrice = item.salePrice !== undefined && item.salePrice !== null ? Number(item.salePrice) : price;
//     const discount = Number(item.discount || 0);
//     const tax = Number(item.tax || 0);
//     const shippingCost = Number(item.shippingCost || 0);
//     const discountedPrice = salePrice * (1 - discount / 100);
//     const taxedPrice = discountedPrice * (1 + tax / 100);
//     const itemTotal = Number(((taxedPrice + shippingCost) * quantity).toFixed(2));

//     return {
//       product: item._id,
//       name: item.name,
//       quantity,
//       price,
//       salePrice,
//       shippingCost,
//       discount,
//       tax,
//       itemTotal,
//       selectedVariant: item.selectedVariant || null,
//       isEggless: item.isEggless || false,
//       deliveryTime: item.deliveryTime,
//       expectedDeliveryDate: item.expectedDeliveryDate,
//       flavor: item.flavor?.name || item.flavor || null,
//       weight: item.weight || null,
//       flowerCount: item.flowerCount || null,
//     };
//   });

//   if (paymentMethod === 'COD') {
//     const nonCodItem = items.find((item) => item.isCodAvailable === false || item.isCodAvailable === 'false');
//     if (nonCodItem) {
//       const error = new Error('COD is not available for one or more items in your cart.');
//       error.statusCode = 400;
//       throw error;
//     }
//   }

//   const calculatedTotal = processedItems.reduce((sum, item) => sum + item.itemTotal, 0);
//   const finalTotal = Number((calculatedTotal - discountAmount).toFixed(2));

//   const order = new Order({
//     user: userId,
//     trackingToken: crypto.randomBytes(16).toString("hex"),
//     items: processedItems,
//     totalAmount: finalTotal,
//     shippingAddress,
//     razorpayOrderId,
//     paymentMethod,
//     status: 'Pending',
//     paymentStatus: 'Pending',
//     couponCode,
//     discountAmount
//   });

//   const savedOrder = await order.save();

//   if (couponCode) {
//     await Coupon.findOneAndUpdate({ code: couponCode }, { $inc: { usedCount: 1 } });
//   }

//   // If COD, send email notification immediately
//   if (paymentMethod === 'COD') {
//     const user = await User.findById(userId);
//     if (user) {
//       emailService.sendOrderNotification(savedOrder, user);
//     }
//   }

//   // WhatsApp: order placed (Pending)
//   try {
//     const user = await User.findById(userId);
//     const toList = [user?.mobileNumber, savedOrder?.shippingAddress?.phone].filter(Boolean);
//     const results = await whatsappService.sendWhatsAppMessageToMany({
//       toList,
//       body: whatsappService.formatOrderUpdateMessage({
//         order: savedOrder,
//         statusOverride: "Pending",
//       }),
//     });
//     await appendWhatsAppLogs(savedOrder._id, "order_placed", results);
//   } catch (err) {
//     console.warn("[whatsapp] order placed send failed:", err?.message || err);
//   }

//   return savedOrder;
// };

// // Update order after payment verification (notifications run in background)
// exports.markPaymentSuccess = async (razorpayOrderId, razorpayPaymentId) => {
//   const updatedOrder = await Order.findOneAndUpdate(
//     { razorpayOrderId },
//     {
//       razorpayPaymentId,
//       paymentStatus: "Success",
//       status: "Processing",
//       processingAt: new Date(),
//     },
//     { new: true }
//   ).populate("user");

//   if (updatedOrder) {
//     void sendPostPaymentNotifications(updatedOrder);
//   }

//   return updatedOrder;
// };

// // Mark payment as failed
// exports.markPaymentFailed = async (razorpayOrderId) => {
//   return await Order.findOneAndUpdate(
//     { razorpayOrderId },
//     { paymentStatus: "Failed" },
//     { new: true }
//   );
// };

// // Get all orders for a specific user
// exports.getUserOrders = async (userId) => {
//   return await Order.find({ user: userId })
//     .populate("items.product", "image name salePrice price")
//     .sort("-createdAt");
// };

// // ─── ADMIN ──────────────────────────────────────────────

// // Get all orders (admin)
// exports.getAllOrders = async ({ page = 1, limit = 10, search = "" } = {}) => {
//   const skip = (page - 1) * limit;
//   let query = {};

//   if (search) {
//     // Check if search is a valid ObjectId (Order ID)
//     const mongoose = require("mongoose");
//     const isObjectId = mongoose.Types.ObjectId.isValid(search);

//     if (isObjectId) {
//       query = { _id: search };
//     } else {
//       // Search in user details (needs populate or aggregation, but simpler to search in populated fields if possible)
//       // For simplicity, we'll try to find users first or use aggregation
//       const users = await User.find({
//         $or: [
//           { name: { $regex: search, $options: "i" } },
//           { email: { $regex: search, $options: "i" } }
//         ]
//       }).select('_id');

//       query = { user: { $in: users.map(u => u._id) } };
//     }
//   }

//   const orders = await Order.find(query)
//     .populate("user", "name email")
//     .sort("-createdAt")
//     .skip(skip)
//     .limit(limit);

//   const total = await Order.countDocuments(query);

//   return {
//     data: orders,
//     total,
//     page: Number(page),
//     totalPages: Math.ceil(total / limit),
//   };
// };

// // Get single order detail by ID (admin)
// exports.getOrderById = async (id) => {
//   return await Order.findById(id)
//     .populate("user", "name email mobileNumber")
//     .populate("items.product", "image name salePrice price");
// };

// // Public: fetch limited order info by tracking token
// exports.getPublicOrderByTrackingToken = async (trackingToken) => {
//   if (!trackingToken) return null;

//   const order = await Order.findOne({ trackingToken })
//     .populate("items.product", "image name salePrice price")
//     .select(
//       "trackingToken status paymentMethod paymentStatus totalAmount shippingAddress items processingAt shippedAt deliveredAt cancelledAt createdAt updatedAt"
//     );

//   if (!order) return null;

//   // Reduce shipping fields to safe subset (no full address)
//   const safeShipping = {
//     fullName: order.shippingAddress?.fullName,
//     phone: order.shippingAddress?.phone,
//     pinCode: order.shippingAddress?.pinCode,
//     landmark: order.shippingAddress?.landmark,
//   };

//   return {
//     _id: order._id,
//     trackingToken: order.trackingToken,
//     status: order.status,
//     paymentMethod: order.paymentMethod,
//     paymentStatus: order.paymentStatus,
//     totalAmount: order.totalAmount,
//     shippingAddress: safeShipping,
//     items: order.items,
//     processingAt: order.processingAt,
//     shippedAt: order.shippedAt,
//     deliveredAt: order.deliveredAt,
//     cancelledAt: order.cancelledAt,
//     createdAt: order.createdAt,
//     updatedAt: order.updatedAt,
//   };
// };

// // Update order status (admin)
// exports.updateOrderStatus = async (id, status) => {
//   const updateData = { status };

//   if (status === "Processing") updateData.processingAt = Date.now();
//   if (status === "Shipped") updateData.shippedAt = Date.now();
//   if (status === "Delivered") updateData.deliveredAt = Date.now();
//   if (status === "Cancelled") updateData.cancelledAt = Date.now();

//   const updated = await Order.findByIdAndUpdate(id, updateData, { new: true }).populate("user");

//   if (updated) {
//     try {
//       const toList = [updated?.user?.mobileNumber, updated?.shippingAddress?.phone].filter(Boolean);
//       const results = await whatsappService.sendWhatsAppMessageToMany({
//         toList,
//         body: whatsappService.formatOrderUpdateMessage({
//           order: updated,
//           statusOverride: status,
//         }),
//       });
//       await appendWhatsAppLogs(updated._id, "order_status_update", results);
//     } catch (err) {
//       console.warn("[whatsapp] order status send failed:", err?.message || err);
//     }
//   }

//   return updated;
// };

// // Mark order as viewed by admin
// exports.markOrderAsViewed = async (id) => {
//   return await Order.findByIdAndUpdate(id, { isAdminViewed: true }, { new: true });
// };

// // Get unviewed orders (for alerts)
// exports.getUnviewedOrders = async () => {
//   return await Order.find({ isAdminViewed: false, $or: [{ paymentMethod: 'COD' }, { paymentStatus: 'Success' }] })
//     .populate("user", "name email");
// };


const Order = require("../models/Order");
const Coupon = require("../models/Coupon");
const emailService = require("../utils/emailService");
const User = require("../models/User");
const crypto = require("crypto");
const whatsappService = require("../utils/whatsappService");
const { calculateItemPricing } = require("../utils/priceCalculator");

async function appendWhatsAppLogs(orderId, event, results) {
  if (!orderId || !Array.isArray(results) || results.length === 0) return;
  const logs = results.map((r) => ({
    event,
    to: r?.to,
    sid: r?.sid,
    success: Boolean(r?.success),
    skipped: Boolean(r?.skipped),
    reason: r?.reason,
    error: r?.error
      ? {
          status: r.error.status != null ? Number(r.error.status) : undefined,
          code: r.error.code != null ? Number(r.error.code) : undefined,
          message: r.error.message ? String(r.error.message) : undefined,
          moreInfo: r.error.moreInfo ? String(r.error.moreInfo) : undefined,
        }
      : undefined,
    createdAt: new Date(),
  }));
  await Order.findByIdAndUpdate(orderId, { $push: { whatsappLogs: { $each: logs } } });
}

async function sendPostPaymentNotifications(updatedOrder) {
  try {
    await emailService.sendOrderNotification(updatedOrder, updatedOrder.user);
  } catch (err) {
    console.warn("[email] order notification failed:", err?.message || err);
  }

  try {
    const toList = [
      updatedOrder?.user?.mobileNumber,
      updatedOrder?.shippingAddress?.phone,
    ].filter(Boolean);
    const results = await whatsappService.sendWhatsAppMessageToMany({
      toList,
      body: whatsappService.formatOrderUpdateMessage({
        order: updatedOrder,
        statusOverride: "Processing",
      }),
    });
    await appendWhatsAppLogs(updatedOrder._id, "order_processing", results);
  } catch (err) {
    console.warn("[whatsapp] order processing send failed:", err?.message || err);
  }
}

// Create a new order record in DB
exports.createOrder = async ({ userId, items, shippingAddress, razorpayOrderId, paymentMethod = 'Online', couponCode, discountAmount = 0 }) => {
  const processedItems = items.map((item) => {
    // Same formula/rounding used by the cart, so the total the user saw in
    // the cart is exactly the total they get charged here.
    const pricing = calculateItemPricing({
      price: item.price,
      salePrice: item.salePrice,
      discount: item.discount,
      tax: item.tax,
      shippingCost: item.shippingCost,
      quantity: item.quantity,
    });

    return {
      product: item._id,
      name: item.name,
      quantity: pricing.quantity,
      price: pricing.price,
      salePrice: pricing.salePrice,
      shippingCost: pricing.shippingCost,
      discount: pricing.discount,
      tax: pricing.tax,
      discountAmount: pricing.discountAmount,
      taxAmount: pricing.taxAmount,
      itemTotal: pricing.itemTotal,
      selectedVariant: item.selectedVariant || null,
      isEggless: item.isEggless || false,
      deliveryTime: item.deliveryTime,
      expectedDeliveryDate: item.expectedDeliveryDate,
      flavor: item.flavor?.name || item.flavor || null,
      weight: item.weight || null,
      flowerCount: item.flowerCount || null,
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
    const results = await whatsappService.sendWhatsAppMessageToMany({
      toList,
      body: whatsappService.formatOrderUpdateMessage({
        order: savedOrder,
        statusOverride: "Pending",
      }),
    });
    await appendWhatsAppLogs(savedOrder._id, "order_placed", results);
  } catch (err) {
    console.warn("[whatsapp] order placed send failed:", err?.message || err);
  }

  return savedOrder;
};

// Update order after payment verification (notifications run in background)
exports.markPaymentSuccess = async (razorpayOrderId, razorpayPaymentId) => {
  const updatedOrder = await Order.findOneAndUpdate(
    { razorpayOrderId },
    {
      razorpayPaymentId,
      paymentStatus: "Success",
      status: "Processing",
      processingAt: new Date(),
    },
    { new: true }
  ).populate("user");

  if (updatedOrder) {
    void sendPostPaymentNotifications(updatedOrder);
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
      const results = await whatsappService.sendWhatsAppMessageToMany({
        toList,
        body: whatsappService.formatOrderUpdateMessage({
          order: updated,
          statusOverride: status,
        }),
      });
      await appendWhatsAppLogs(updated._id, "order_status_update", results);
    } catch (err) {
      console.warn("[whatsapp] order status send failed:", err?.message || err);
    }
  }

  return updated;
};

// Delete order (admin) — unrestricted, admin can delete at any time
exports.deleteOrder = async (id) => {
  const order = await Order.findById(id);
  if (!order) {
    const error = new Error("Order not found");
    error.statusCode = 404;
    throw error;
  }
  await order.deleteOne();
  return { success: true };
};

// Delete order (user) — strictly allowed only when Delivered
exports.deleteUserOrder = async (userId, orderId) => {
  const order = await Order.findOne({ _id: orderId, user: userId });
  if (!order) {
    const error = new Error("Order not found");
    error.statusCode = 404;
    throw error;
  }
  if (order.status !== "Delivered") {
    const error = new Error("You can only delete an order after it has been delivered successfully.");
    error.statusCode = 400;
    throw error;
  }
  await order.deleteOne();
  return { success: true };
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

// Delete multiple orders (admin) — unrestricted bulk delete
exports.deleteMultipleOrders = async (ids) => {
  if (!Array.isArray(ids) || ids.length === 0) {
    throw new Error("No order IDs provided");
  }
  const result = await Order.deleteMany({ _id: { $in: ids } });
  return { success: true, deletedCount: result.deletedCount };
};
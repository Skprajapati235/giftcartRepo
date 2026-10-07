const Order = require("../models/Order");
const Coupon = require("../models/Coupon");
const emailService = require("../utils/emailService");
const User = require("../models/User");
const crypto = require("crypto");
const whatsappService = require("../utils/whatsappService");
const { calculateItemPricing } = require("../utils/priceCalculator");
const deliverySlotService = require("./deliverySlotService");

async function appendWhatsAppLogs(orderId, event, results) {
  if (!orderId || !Array.isArray(results) || results.length === 0) return;
  const logs = results.map((r) => ({
    event,
    to: r?.to,
    sid: r?.sid,
    status: r?.status || (r?.success ? "queued" : "failed"),
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

// async function sendPostPaymentNotifications(updatedOrder) {
//   try {
//     await emailService.sendOrderNotification(updatedOrder, updatedOrder.user);
//   } catch (err) {
//     console.warn("[email] order notification failed:", err?.message || err);
//   }

async function sendPostPaymentNotifications(updatedOrder) {
  try {
    await emailService.sendOrderNotification(updatedOrder, updatedOrder.user);
    updatedOrder.orderEmailSentAt = new Date();
    await updatedOrder.save();
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
exports.createOrder = async ({
  userId,
  items,
  shippingAddress,
  razorpayOrderId,
  paymentMethod = 'Online',
  couponCode,
  discountAmount = 0,
  deliverySlot,
  messageOnCake,
  cardMessage,
  senderName,
  recipientName,
  addons = [],
}) => {
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
      messageOnCake: item.messageOnCake || "",
      customImage: item.customImage || "",
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

  const calculatedItemsTotal = processedItems.reduce((sum, item) => sum + item.itemTotal, 0);
  const slotExtra = Number(deliverySlot?.extraCharge || 0);
  const addonsTotal = (addons || []).reduce((sum, a) => sum + (Number(a.price || 0) * Number(a.quantity || 1)), 0);
  const finalTotal = Number((calculatedItemsTotal + slotExtra + addonsTotal - discountAmount).toFixed(2));

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
    discountAmount,
    deliverySlot: deliverySlot || undefined,
    messageOnCake: messageOnCake || "",
    cardMessage: cardMessage || "",
    senderName: senderName || "",
    recipientName: recipientName || "",
    addons: (addons || []).map((a) => ({
      name: a.name,
      price: Number(a.price || 0),
      quantity: Number(a.quantity || 1),
      image: a.image || "",
      category: a.category || "accessory",
    })),
    kitchenStatus: "Pending",
  });

  const savedOrder = await order.save();

  // Two customers can pass the slot check at the same moment — roll back the
  // later one if the slot is over capacity (throws 409 SLOT_UNAVAILABLE).
  await deliverySlotService.enforceCapacity(savedOrder);

  if (couponCode) {
    await Coupon.findOneAndUpdate({ code: couponCode }, { $inc: { usedCount: 1 } });
  }

  // If COD, send email notification immediately
  // if (paymentMethod === 'COD') {
  //   const user = await User.findById(userId);
  //   if (user) {
  //     emailService.sendOrderNotification(savedOrder, user);
  //   }
  // }

  // If COD, send email notification immediately
  // if (paymentMethod === 'COD') {
  //   const user = await User.findById(userId);
  //   if (user) {
  //     emailService.sendOrderNotification(savedOrder, user);
  //   }
  //   savedOrder.orderEmailSentAt = new Date();
  //   await savedOrder.save();
  // }
  // Note: COD order-confirmation email is NOT sent here — the customer app
  // calls POST /order/:id/send-email right after this response, and that is
  // now the single place COD emails are sent from (see orderController.sendOrderEmail).
  // Keeping only one trigger point avoids any chance of a stale "already sent"
  // guard blocking a legitimate, brand-new order's email.

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
      isPaymentAbandoned: false,
      paymentCancelReason: null,
      status: "Processing",
      kitchenStatus: "Processing",
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
exports.markPaymentFailed = async (razorpayOrderId, reason = "Payment failed at gateway") => {
  return await Order.findOneAndUpdate(
    { razorpayOrderId },
    {
      paymentStatus: "Failed",
      isPaymentAbandoned: true,
      paymentCancelReason: reason,
      paymentAbandonedAt: new Date(),
      status: "Cancelled",
      kitchenStatus: "Cancelled",
      cancelledAt: new Date(),
    },
    { new: true }
  );
};

// Mark order payment as incomplete (customer backed out / closed checkout)
exports.markPaymentIncomplete = async ({ orderId, razorpayOrderId, reason = "User returned without completing payment", userId } = {}) => {
  const mongoose = require("mongoose");
  const query = {};
  if (orderId && mongoose.Types.ObjectId.isValid(orderId)) {
    query._id = orderId;
  } else if (razorpayOrderId) {
    query.razorpayOrderId = razorpayOrderId;
  } else {
    return null;
  }

  const existingOrder = await Order.findOne(query);
  if (!existingOrder) return null;

  // If non-admin user is specified, verify ownership
  if (userId && String(existingOrder.user) !== String(userId)) {
    const err = new Error("Not authorized for this order");
    err.statusCode = 403;
    throw err;
  }

  // Do not overwrite if payment is already Success
  if (existingOrder.paymentStatus === "Success") {
    return existingOrder;
  }

  existingOrder.paymentStatus = "Incomplete";
  existingOrder.isPaymentAbandoned = true;
  existingOrder.paymentCancelReason = reason || "User returned without completing payment";
  existingOrder.paymentAbandonedAt = new Date();
  existingOrder.status = "Cancelled";
  existingOrder.kitchenStatus = "Cancelled";
  existingOrder.cancelledAt = new Date();

  return await existingOrder.save();
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

  const normalizedSearch = String(search || "").trim();
  if (normalizedSearch) {
    const mongoose = require("mongoose");
    const escapedSearch = normalizedSearch.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
    const users = await User.find({
      $or: [
        { name: { $regex: escapedSearch, $options: "i" } },
        { email: { $regex: escapedSearch, $options: "i" } },
        { mobileNumber: { $regex: escapedSearch, $options: "i" } },
      ],
    }).select("_id");

    const isObjectId = mongoose.Types.ObjectId.isValid(normalizedSearch);
    query = {
      $or: [
        { "shippingAddress.fullName": { $regex: escapedSearch, $options: "i" } },
        { "shippingAddress.phone": { $regex: escapedSearch, $options: "i" } },
        { "items.name": { $regex: escapedSearch, $options: "i" } },
        { user: { $in: users.map((user) => user._id) } },
        ...(isObjectId ? [{ _id: new mongoose.Types.ObjectId(normalizedSearch) }] : []),
        {
          $expr: {
            $regexMatch: {
              input: { $toString: "$_id" },
              regex: escapedSearch,
              options: "i",
            },
          },
        },
      ],
    };
  }

  const orders = await Order.find(query)
    .populate("user", "name email mobileNumber")
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
  if (!trackingToken || typeof trackingToken !== "string") return null;

  const order = await Order.findOne({ trackingToken })
    .populate("items.product", "image name salePrice price")
    .select(
      "trackingToken status paymentMethod paymentStatus isPaymentAbandoned totalAmount discountAmount shippingAddress items deliverySlot addons " +
      "receivedAt pendingAt inKitchenAt processingAt packedAt outForDeliveryAt shippingAt shippedAt deliveredAt cancelledAt createdAt updatedAt"
    )
    .lean();

  if (!order) return null;

  // Public link → expose only a safe subset of the address (no street, no full phone).
  const safeShipping = {
    fullName: order.shippingAddress?.fullName,
    city: order.shippingAddress?.city,
    state: order.shippingAddress?.state,
    pinCode: order.shippingAddress?.pinCode,
    landmark: order.shippingAddress?.landmark,
    phoneLast4: String(order.shippingAddress?.phone || "").replace(/\D/g, "").slice(-4) || undefined,
  };

  return {
    _id: order._id,
    orderNumber: String(order._id).substring(0, 8).toUpperCase(),
    trackingToken: order.trackingToken,
    status: order.status,
    paymentMethod: order.paymentMethod,
    paymentStatus: order.paymentStatus,
    isPaymentAbandoned: Boolean(order.isPaymentAbandoned),
    totalAmount: order.totalAmount,
    discountAmount: order.discountAmount || 0,
    shippingAddress: safeShipping,
    items: order.items,
    addons: (order.addons || []).map((a) => ({ name: a.name, quantity: a.quantity })),
    deliverySlot: order.deliverySlot || null,
    receivedAt: order.receivedAt,
    pendingAt: order.pendingAt,
    inKitchenAt: order.inKitchenAt,
    processingAt: order.processingAt,
    packedAt: order.packedAt,
    outForDeliveryAt: order.outForDeliveryAt,
    shippingAt: order.shippingAt,
    shippedAt: order.shippedAt,
    deliveredAt: order.deliveredAt,
    cancelledAt: order.cancelledAt,
    createdAt: order.createdAt,
    updatedAt: order.updatedAt,
  };
};

// Update order status (admin)
exports.updateOrderStatus = async (id, status) => {
  const statusAliases = {
    Preparing: "In Kitchen",
    OutForDelivery: "Out for Delivery",
    Shipped: "Shipping",
  };
  const normalizedStatus = statusAliases[status] || status;
  const validStatuses = [
    "Received",
    "Pending",
    "In Kitchen",
    "Processing",
    "Packed",
    "Out for Delivery",
    "Shipping",
    "Delivered",
    "Cancelled",
  ];

  if (!validStatuses.includes(normalizedStatus)) {
    const error = new Error("Invalid order status");
    error.statusCode = 400;
    throw error;
  }

  const updateData = {
    status: normalizedStatus,
    kitchenStatus: normalizedStatus,
  };
  const now = Date.now();

  if (normalizedStatus === "Received") updateData.receivedAt = now;
  if (normalizedStatus === "Pending") updateData.pendingAt = now;
  if (normalizedStatus === "In Kitchen") updateData.inKitchenAt = now;
  if (normalizedStatus === "Processing") updateData.processingAt = now;
  if (normalizedStatus === "Packed") updateData.packedAt = now;
  if (normalizedStatus === "Out for Delivery") updateData.outForDeliveryAt = now;
  if (normalizedStatus === "Shipping") updateData.shippingAt = now;
  if (normalizedStatus === "Delivered") updateData.deliveredAt = now;
  if (normalizedStatus === "Cancelled") updateData.cancelledAt = now;

  const updated = await Order.findByIdAndUpdate(id, updateData, { new: true, runValidators: true }).populate("user");

  // Order band hua (Delivered / Cancelled) to rider ka load aur status refresh karo,
  // chahe change Orders page se hua ho ya Delivery Fleet page se.
  if (updated && updated.assignedRider && ["Delivered", "Cancelled"].includes(normalizedStatus)) {
    try {
      const DeliveryRider = require("../models/DeliveryRider");
      const [activeOrders, deliveredCount, rider] = await Promise.all([
        Order.countDocuments({ assignedRider: updated.assignedRider, status: { $nin: ["Delivered", "Cancelled"] } }),
        Order.countDocuments({ assignedRider: updated.assignedRider, status: "Delivered" }),
        DeliveryRider.findById(updated.assignedRider),
      ]);
      if (rider) {
        rider.activeOrders = activeOrders;
        rider.totalDeliveriesCompleted = deliveredCount;
        if (rider.status !== "Offline") rider.status = activeOrders > 0 ? "En Route" : "Available";
        await rider.save();
      }
    } catch (err) {
      console.warn("[fleet] rider release failed:", err?.message || err);
    }
  }

  if (updated) {
    try {
      const toList = [updated?.user?.mobileNumber, updated?.shippingAddress?.phone].filter(Boolean);
      const results = await whatsappService.sendWhatsAppMessageToMany({
        toList,
        body: whatsappService.formatOrderUpdateMessage({
          order: updated,
          statusOverride: normalizedStatus,
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

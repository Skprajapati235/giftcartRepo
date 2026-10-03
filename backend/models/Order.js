const mongoose = require("mongoose");

const orderSchema = new mongoose.Schema({
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User",
    required: true,
  },
  trackingToken: {
    type: String,
    index: true,
    unique: true,
    sparse: true,
  },
  whatsappLogs: [
    {
      event: { type: String }, // e.g. order_placed, order_processing, order_status_update
      to: { type: String },
      sid: { type: String },
      success: { type: Boolean },
      skipped: { type: Boolean },
      reason: { type: String },
      error: {
        status: { type: Number },
        code: { type: Number },
        message: { type: String },
        moreInfo: { type: String },
      },
      createdAt: { type: Date, default: Date.now },
    },
  ],
  items: [
    {
      product: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Product",
        required: true,
      },
      name: { type: String, required: true },
      quantity: { type: Number, required: true },
      price: { type: Number, required: true },
      salePrice: { type: Number },
      selectedVariant: { type: String },
      isEggless: { type: Boolean, default: false },
      shippingCost: { type: Number, default: 0 },
      discount: { type: Number, default: 0 },
      tax: { type: Number, default: 0 },
      // Exact rupee amounts computed at order time (utils/priceCalculator.js) —
      // stored so every screen (website, admin panel) reads the SAME numbers
      // instead of each re-deriving its own from the discount/tax percentages.
      discountAmount: { type: Number, default: 0 },
      taxAmount: { type: Number, default: 0 },
      itemTotal: { type: Number, required: true },
      deliveryTime: { type: String },
      expectedDeliveryDate: { type: String },
      flavor: { type: String },
      weight: { type: String },
      flowerCount: { type: String },
      messageOnCake: { type: String, default: "" },
      customImage: { type: String, default: "" },
    },
  ],
  deliverySlot: {
    // Reference to the DeliverySlot used — lets us count capacity per date exactly.
    slotId: { type: mongoose.Schema.Types.ObjectId, ref: "DeliverySlot" },
    slotName: { type: String },
    slotType: { type: String, default: "standard" },
    timeRange: { type: String },
    extraCharge: { type: Number, default: 0 },
    deliveryDate: { type: String },
  },
  messageOnCake: { type: String, default: "" },
  cardMessage: { type: String, default: "" },
  senderName: { type: String, default: "" },
  recipientName: { type: String, default: "" },
  addons: [
    {
      name: { type: String, required: true },
      price: { type: Number, required: true },
      quantity: { type: Number, default: 1 },
      image: { type: String },
      category: { type: String },
    },
  ],
  kitchenStatus: {
    type: String,
    enum: ["Received", "Pending", "In Kitchen", "Processing", "Packed", "Out for Delivery", "Shipping", "Delivered", "Cancelled", "Preparing", "OutForDelivery"],
    default: "Pending",
  },
  totalAmount: { type: Number, required: true },
  shippingAddress: {
    fullName: { type: String, required: true },
    phone: { type: String, required: true },
    houseNo: { type: String, required: true },
    street: { type: String, required: true },
    landmark: { type: String },
    pinCode: { type: String, required: true },
    address: { type: String }, // For backward compatibility/summary
  },
  status: {
    type: String,
    enum: ["Received", "Pending", "In Kitchen", "Processing", "Packed", "Out for Delivery", "Shipping", "Delivered", "Cancelled", "Shipped"],
    default: "Pending",
  },
  paymentMethod: {
    type: String,
    enum: ["COD", "Online"],
    default: "Online",
  },
  razorpayOrderId: { type: String },
  razorpayPaymentId: { type: String },
  paymentStatus: {
    type: String,
    enum: ["Pending", "Success", "Failed", "Cancelled", "Incomplete", "Abandoned"],
    default: "Pending",
  },
  isPaymentAbandoned: { type: Boolean, default: false },
  paymentCancelReason: { type: String, default: null },
  paymentAbandonedAt: { type: Date, default: null },
  couponCode: { type: String },
  discountAmount: { type: Number, default: 0 },
  isAdminViewed: { type: Boolean, default: false },
  // Set once the "New Order Received" admin email has actually been sent
  // for this order — lets every trigger point (COD auto-send on create,
  // online auto-send after payment, and the customer app's explicit
  // /order/:id/send-email call) share one guard so the admin never gets
  // duplicate emails for the same order.
  orderEmailSentAt: { type: Date, default: null },
  processingAt: { type: Date },
  receivedAt: { type: Date },
  pendingAt: { type: Date },
  inKitchenAt: { type: Date },
  packedAt: { type: Date },
  outForDeliveryAt: { type: Date },
  shippingAt: { type: Date },
  shippedAt: { type: Date },
  deliveredAt: { type: Date },
  cancelledAt: { type: Date },
}, { timestamps: true });

// Capacity lookups: "how many orders hold slot X on date Y?"
orderSchema.index({ "deliverySlot.slotId": 1, "deliverySlot.deliveryDate": 1 });

module.exports = mongoose.model("Order", orderSchema);

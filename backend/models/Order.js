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
      shippingCost: { type: Number, default: 0 },
      discount: { type: Number, default: 0 },
      tax: { type: Number, default: 0 },
      itemTotal: { type: Number, required: true },
      deliveryTime: { type: String },
      expectedDeliveryDate: { type: String },
    },
  ],
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
    enum: ["Pending", "Processing", "Shipped", "Delivered", "Cancelled"],
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
    enum: ["Pending", "Success", "Failed"],
    default: "Pending",
  },
  couponCode: { type: String },
  discountAmount: { type: Number, default: 0 },
  isAdminViewed: { type: Boolean, default: false },
  processingAt: { type: Date },
  shippedAt: { type: Date },
  deliveredAt: { type: Date },
  cancelledAt: { type: Date },
}, { timestamps: true });

module.exports = mongoose.model("Order", orderSchema);

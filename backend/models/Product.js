const mongoose = require("mongoose");

const productSchema = new mongoose.Schema({
  name: { type: String, required: true },
  price: { type: Number, required: true },
  salePrice: { type: Number },
  image: { type: String },
  description: { type: String },
  summary: { type: String },
  layout: { type: String },
  weight: { type: String },
  flowers: { type: Number },
  shippingCost: { type: Number, default: 0 },
  discount: { type: Number, default: 0 },
  tax: { type: Number, default: 0 },
  category: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Category",
    required: true
  },
  isCodAvailable: { type: Boolean, default: true },
  ratings: { type: Number, default: 0 },
  numReviews: { type: Number, default: 0 },
  deliveryTime: { type: String, default: "3-5" }, // e.g., "2-4 days"
  expectedDeliveryDate: { type: String, default: "Monday, 20 Oct" } // e.g., "Tomorrow"
}, { timestamps: true });

module.exports = mongoose.model("Product", productSchema);
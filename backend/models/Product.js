const mongoose = require("mongoose");

const productSchema = new mongoose.Schema({
  name: { type: String, required: true },
  price: { type: Number, required: true },
  salePrice: { type: Number },
  image: { type: String },
  images: [{ type: String }],
  description: { type: String },
  summary: { type: String },
  layout: { type: String },
  weight: { type: String },
  weightOptions: [{
    weight: String,
    price: Number
  }],
  flowers: { type: Number },
  flowerOptions: [{
    count: Number,
    price: Number
  }],
  hasEgglessOption: { type: Boolean, default: false },
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
  deliveryTime: { type: String, default: "24-48" }, // e.g., "2-4 hours"
  expectedDeliveryDate: { type: String, default: "2 Hours" } // e.g., "Tomorrow"
}, { timestamps: true });

module.exports = mongoose.model("Product", productSchema);
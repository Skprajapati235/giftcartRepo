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
  expectedDeliveryDate: { type: String, default: "2 Hours" }, // e.g., "Tomorrow"
  flavor: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Flavor"
  },
  weight: { type: String }, // e.g., "500g", "1kg"
  flowerCount: { type: String }, // e.g., "10 Roses", "24 Lilies"
  // Product schema ke andar, existing fields ke sath (before closing }):
  // weight: { type: String }, // e.g., "500g", "1kg"
  flowerCount: { type: String }, // e.g., "10 Roses", "24 Lilies"
  // Which cities this product can be delivered to. Empty/undefined array
  // means "available everywhere" so existing products keep working exactly
  // as before this field was added — nothing becomes invisible by default.
  availableCities: [{ type: String }]
}, { timestamps: true });

module.exports = mongoose.model("Product", productSchema);
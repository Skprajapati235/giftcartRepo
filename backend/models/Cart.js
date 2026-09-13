// PATH: backend/models/Cart.js  (NAYI FILE)
const mongoose = require("mongoose");

const cartItemSchema = new mongoose.Schema(
  {
    product: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Product",
      required: true,
    },
    quantity: { type: Number, required: true, default: 1, min: 1 },
    // Variant selection made by the user on the product page.
    weight: { type: String, default: null },
    flowerCount: { type: String, default: null },
    flavor: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Flavor",
      default: null,
    },
    isEggless: { type: Boolean, default: false },
    // Used to tell apart two cart lines for the same product with
    // different variants (weight/flavor/flowerCount combination).
    variantKey: { type: String, required: true },
  },
  { timestamps: true }
);

const cartSchema = new mongoose.Schema(
  {
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
      unique: true,
      index: true,
    },
    items: [cartItemSchema],
  },
  { timestamps: true }
);

module.exports = mongoose.model("Cart", cartSchema);
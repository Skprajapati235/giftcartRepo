const mongoose = require("mongoose");

const wishlistSchema = new mongoose.Schema({
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User",
    required: true
  },
  product: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Product",
    required: true
  },
  notes: {
    type: String,
    default: ""
  }
}, { timestamps: true });

// Ensure a user can only have a specific product in their wishlist once
wishlistSchema.index({ user: 1, product: 1 }, { unique: true });

module.exports = mongoose.model("Wishlist", wishlistSchema);

const mongoose = require("mongoose");

const couponSchema = new mongoose.Schema({
  code: {
    type: String,
    required: true,
    unique: true,
    uppercase: true,
    trim: true,
  },
  discountType: {
    type: String,
    enum: ["percentage", "fixed"],
    default: "percentage",
  },
  discountValue: {
    type: Number,
    required: true,
  },
  minOrderAmount: {
    type: Number,
    default: 0,
  },
  maxDiscount: {
    type: Number,
    default: 0, // 0 means no limit for percentage discounts
  },
  expiryDate: {
    type: Date,
    required: true,
  },
  usageLimit: {
    type: Number,
    default: 100, // how many times this coupon can be used overall
  },
  usedCount: {
    type: Number,
    default: 0,
  },
  isActive: {
    type: Boolean,
    default: true,
  },
  image: {
    type: String,
  },
  // ── Targeting (who/what this offer applies to) ──────────────────────
  // Only ever usable by a mobile number that has never placed a
  // successful order before — checked at validate() time.
  isNewUserOnly: {
    type: Boolean,
    default: false,
  },
  // Empty array = applies to every product. Non-empty = cart must only
  // contain products from this list for the coupon to apply.
  applicableProducts: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: "Product",
  }],
  // Empty array = applies regardless of occasion. Non-empty = every
  // product in the cart must belong to at least one of these occasions.
  applicableOccasions: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: "Occasion",
  }],
}, { timestamps: true });

module.exports = mongoose.model("Coupon", couponSchema);

const mongoose = require("mongoose");

const leadSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: true,
      trim: true,
    },
    phone: {
      type: String,
      required: true,
    },
    email: {
      type: String,
      trim: true,
      lowercase: true,
    },
    source: {
      type: String,
      enum: [
        "instagram",
        "facebook",
        "website",
        "whatsapp",
        "phone",
        "google",
        "referral",
        "advertisement",
        "offline",
      ],
      default: "website",
    },
    medium: String,
    campaign: String,
    status: {
      type: String,
      enum: [
        "NEW",
        "CONTACTED",
        "INTERESTED",
        "OFFER_SENT",
        "PAYMENT_PENDING",
        "CONVERTED",
        "LOST",
      ],
      default: "NEW",
    },
    productId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Product",
    },
    categoryId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Category",
    },
    interestedProduct: String,
    city: String,
    location: String,
    referralCode: String,
    referrerCustomerId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
    },
    assignedTo: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Admin",
    },
    notes: String,
    lastContactedAt: Date,
    convertedAt: Date,
    orderId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Order",
    },
  },
  {
    timestamps: true,
  }
);

module.exports = mongoose.model("Lead", leadSchema);

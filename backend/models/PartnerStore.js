const mongoose = require("mongoose");

const partnerStoreSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: [true, "Store name is required"],
      trim: true,
    },
    image: {
      type: String,
      default: "",
      trim: true,
    },
    ownerFirstName: {
      type: String,
      required: [true, "Owner first name is required"],
      trim: true,
    },
    ownerLastName: {
      type: String,
      default: "",
      trim: true,
    },
    ownerPhone: {
      type: String,
      required: [true, "Owner mobile number is required"],
      trim: true,
    },
    whatsappNumber: {
      type: String,
      required: [true, "WhatsApp number is required"],
      trim: true,
    },
    address: {
      type: String,
      default: "",
      trim: true,
    },
    city: {
      type: String,
      default: "",
      trim: true,
    },
    state: {
      type: String,
      default: "",
      trim: true,
    },
    pincode: {
      type: String,
      default: "",
      trim: true,
    },
    googleMapsUrl: {
      type: String,
      default: "",
      trim: true,
    },
    description: {
      type: String,
      default: "",
      trim: true,
    },
    categories: {
      type: [String],
      default: [],
    },
    commissionPercentage: {
      type: Number,
      default: 0,
      min: 0,
      max: 100,
    },
    status: {
      type: String,
      enum: ["active", "inactive", "onboarding"],
      default: "active",
    },
    notes: {
      type: String,
      default: "",
      trim: true,
    },
    createdBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Admin",
    },
  },
  {
    timestamps: true,
  }
);

// Indexes for fast searching by name, city, phone, and status
partnerStoreSchema.index({ name: "text", city: "text", description: "text" });
partnerStoreSchema.index({ status: 1 });
partnerStoreSchema.index({ city: 1 });

module.exports = mongoose.model("PartnerStore", partnerStoreSchema);

const mongoose = require("mongoose");

const decorationPartnerSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: [true, "Decorator firm/store name is required"],
      trim: true,
    },
    ownerName: {
      type: String,
      required: [true, "Owner name is required"],
      trim: true,
    },
    phone: {
      type: String,
      required: [true, "Contact phone is required"],
      trim: true,
    },
    whatsapp: {
      type: String,
      required: [true, "WhatsApp number is required"],
      trim: true,
    },
    city: {
      type: String,
      default: "Faridabad",
      trim: true,
    },
    coveredAreas: {
      type: [String],
      default: [
        "NIT Faridabad",
        "Sector 15 & 16",
        "Sector 21 & Surajkund",
        "Greater Faridabad (Neharpar)",
        "Sector 14",
        "Old Faridabad",
      ],
    },
    address: {
      type: String,
      default: "",
      trim: true,
    },
    commissionPercentage: {
      type: Number,
      default: 20, // 20% commission or profit share
    },
    status: {
      type: String,
      enum: ["active", "inactive", "onboarding"],
      default: "active",
    },
    rating: {
      type: Number,
      default: 4.9,
    },
    totalSetupsCompleted: {
      type: Number,
      default: 0,
    },
    totalPayoutsReceived: {
      type: Number,
      default: 0,
    },
    notes: {
      type: String,
      default: "",
      trim: true,
    },
  },
  {
    timestamps: true,
  }
);

decorationPartnerSchema.index({ city: 1, status: 1 });
decorationPartnerSchema.index({ phone: 1 });

module.exports = mongoose.model("DecorationPartner", decorationPartnerSchema);

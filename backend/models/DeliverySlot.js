const mongoose = require("mongoose");

const deliverySlotSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: true,
      trim: true,
    },
    type: {
      type: String,
      enum: ["standard", "fixed_time", "midnight", "early_morning"],
      default: "standard",
    },
    startTime: {
      type: String,
      default: "09:00",
    },
    endTime: {
      type: String,
      default: "21:00",
    },
    timeRange: {
      type: String,
      required: true, // e.g. "11:00 PM - 11:59 PM", "02:00 PM - 03:00 PM"
    },
    extraCharge: {
      type: Number,
      default: 0,
      min: 0,
    },
    cutoffTime: {
      type: String,
      default: "", // e.g. "20:00" for midnight slot same-day cutoff
    },
    badge: {
      type: String,
      default: "", // e.g. "Most Popular", "Extra Surprise"
    },
    maxOrdersPerDay: {
      type: Number,
      default: 50,
    },
    isActive: {
      type: Boolean,
      default: true,
    },
    sortOrder: {
      type: Number,
      default: 0,
    },
  },
  { timestamps: true }
);

module.exports = mongoose.model("DeliverySlot", deliverySlotSchema);

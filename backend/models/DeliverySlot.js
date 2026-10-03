// const mongoose = require("mongoose");

// const deliverySlotSchema = new mongoose.Schema(
//   {
//     name: {
//       type: String,
//       required: true,
//       trim: true,
//     },
//     type: {
//       type: String,
//       enum: ["standard", "fixed_time", "fixed", "midnight", "early_morning"],
//       default: "standard",
//     },
//     image: {
//       type: String,
//       default: "",
//     },
//     startTime: {
//       type: String,
//       default: "09:00",
//     },
//     endTime: {
//       type: String,
//       default: "21:00",
//     },
//     timeRange: {
//       type: String,
//       required: true, // e.g. "11:00 PM - 11:59 PM", "02:00 PM - 03:00 PM"
//     },
//     extraCharge: {
//       type: Number,
//       default: 0,
//       min: 0,
//     },
//     cutoffTime: {
//       type: String,
//       default: "", // e.g. "20:00" for midnight slot same-day cutoff
//     },
//     badge: {
//       type: String,
//       default: "", // e.g. "Most Popular", "Extra Surprise"
//     },
//     maxOrdersPerDay: {
//       type: Number,
//       default: 50,
//     },
//     isActive: {
//       type: Boolean,
//       default: true,
//     },
//     sortOrder: {
//       type: Number,
//       default: 0,
//     },
//   },
//   { timestamps: true }
// );

// module.exports = mongoose.model("DeliverySlot", deliverySlotSchema);



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
      enum: ["standard", "fixed_time", "fixed", "midnight", "early_morning"],
      default: "standard",
    },
    image: {
      type: String,
      default: "",
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
    // Last booking time as "HH:mm" (24h), e.g. "20:00". Empty = no cutoff.
    // (Old records may hold free text like "3 hours before slot" — the rules
    // engine in utils/deliverySlotRules.js still understands those.)
    cutoffTime: {
      type: String,
      default: "",
    },
    // 0 = cutoff is on the delivery day, 1 = the evening before, …
    // Intentionally NO default: when unset, early_morning slots fall back to 1.
    cutoffDaysBefore: {
      type: Number,
      min: 0,
      max: 7,
    },
    badge: {
      type: String,
      default: "", // e.g. "Most Popular", "Extra Surprise"
    },
    // Capacity per delivery date. 0 = unlimited.
    maxOrdersPerDay: {
      type: Number,
      default: 50,
      min: 0,
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

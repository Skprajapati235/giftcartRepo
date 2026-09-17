const mongoose = require("mongoose");

const storeSettingSchema = new mongoose.Schema(
  {
    key: {
      type: String,
      required: true,
      unique: true,
    },
    isRestricted: {
      type: Boolean,
      default: false,
    },
    dailyStart: {
      type: String,
      default: "23:00", // 24-hour format HH:mm (e.g., 23:00 = 11:00 PM)
    },
    dailyEnd: {
      type: String,
      default: "07:00", // 24-hour format HH:mm (e.g., 07:00 = 07:00 AM)
    },
    customMessage: {
      type: String,
      default: "Night delivery is currently paused. Available for delivery after 7:00 AM.",
    },
    blockOrders: {
      type: Boolean,
      default: true,
    },
    allowBrowsing: {
      type: Boolean,
      default: true,
    },
    updatedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Admin",
    },
  },
  { timestamps: true }
);

module.exports = mongoose.model("StoreSetting", storeSettingSchema);

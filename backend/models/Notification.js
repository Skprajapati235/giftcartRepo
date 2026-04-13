const mongoose = require("mongoose");

const notificationSchema = new mongoose.Schema({
  type: {
    type: String,
    enum: ["order", "review"],
    required: true,
  },
  message: {
    type: String,
    required: true,
  },
  isRead: {
    type: Boolean,
    default: false,
  },
  link: {
    type: String, // E.g., "/orders" or "/reviews"
  }
}, { timestamps: true });

module.exports = mongoose.model("Notification", notificationSchema);

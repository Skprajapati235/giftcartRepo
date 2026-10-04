const mongoose = require("mongoose");

const auditLogSchema = new mongoose.Schema(
  {
    adminId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Admin",
      default: null,
    },
    adminName: {
      type: String,
      required: true,
      default: "System Admin",
    },
    adminEmail: {
      type: String,
      default: "admin@giftfestive.com",
    },
    adminRole: {
      type: String,
      default: "Super Admin",
    },
    action: {
      type: String,
      required: true,
    },
    module: {
      type: String,
      required: true,
      enum: [
        "Theme Studio",
        "Orders & Kitchen",
        "Catalog",
        "Discounts",
        "Security & Auth",
        "Delivery Fleet",
        "Abandoned Carts",
        "System",
      ],
      default: "System",
    },
    details: {
      type: String,
      default: "",
    },
    severity: {
      type: String,
      enum: ["info", "warning", "success"],
      default: "info",
    },
    ipAddress: {
      type: String,
      default: "127.0.0.1",
    },
    metadata: {
      type: mongoose.Schema.Types.Mixed,
      default: {},
    },
  },
  { timestamps: true }
);

auditLogSchema.index({ createdAt: -1 });
auditLogSchema.index({ module: 1 });

module.exports = mongoose.model("AuditLog", auditLogSchema);

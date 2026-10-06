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
      default: "System",
    },
    details: {
      type: String,
      default: "",
    },
    format: {
      type: String,
      enum: ["csv", "pdf", "json", "excel", "none"],
      default: "none",
    },
    severity: {
      type: String,
      enum: ["info", "warning", "success", "danger", "error"],
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
auditLogSchema.index({ format: 1 });
// Automatically purge records older than 10 days (10 * 24 * 60 * 60 seconds)
auditLogSchema.index({ createdAt: 1 }, { expireAfterSeconds: 864000 });

module.exports = mongoose.model("AuditLog", auditLogSchema);

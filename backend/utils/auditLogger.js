const AuditLog = require("../models/AuditLog");

/**
 * Centrally records administrative activity into MongoDB AuditLog
 */
exports.logActivity = async ({
  req,
  user,
  action,
  module = "System",
  details = "",
  format = "none",
  severity = "info",
  metadata = {},
}) => {
  try {
    const admin = user || req?.user;
    const ip =
      req?.headers?.["x-forwarded-for"]?.split(",")?.[0]?.trim() ||
      req?.socket?.remoteAddress ||
      req?.ip ||
      "127.0.0.1";

    const logEntry = await AuditLog.create({
      adminId: admin?._id || admin?.id || null,
      adminName: admin?.name || "System Admin",
      adminEmail: admin?.email || "admin@giftfestive.com",
      adminRole: admin?.role || "Super Admin",
      action,
      module,
      details,
      format,
      severity,
      ipAddress: ip,
      metadata,
    });

    return logEntry;
  } catch (err) {
    console.warn("[auditLogger] Error recording activity:", err?.message || err);
    return null;
  }
};

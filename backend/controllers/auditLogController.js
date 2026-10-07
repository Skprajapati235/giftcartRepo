const AuditLog = require("../models/AuditLog");
const { logActivity } = require("../utils/auditLogger");

const escapeCsv = (val) => {
  if (val === undefined || val === null) return '""';
  const str = String(val).replace(/"/g, '""');
  return `"${str}"`;
};

exports.getAuditLogs = async (req, res) => {
  try {
    const { module, format, severity, search, limit = 10, page = 1 } = req.query;
    const filter = {};

    // 10-Day Retention Policy: Automatically restrict query to past 10 days
    const tenDaysAgo = new Date(Date.now() - 10 * 24 * 60 * 60 * 1000);
    filter.createdAt = { $gte: tenDaysAgo };

    // Background automatic cleanup of records older than 10 days
    AuditLog.deleteMany({ createdAt: { $lt: tenDaysAgo } }).catch((err) => {
      console.warn("Audit log 10-day purge warning:", err?.message);
    });

    if (module && module !== "All") {
      filter.module = module;
    }

    if (format && format !== "All" && format !== "all") {
      filter.format = format.toLowerCase();
    }

    if (severity && severity !== "All" && severity !== "all") {
      filter.severity = severity.toLowerCase();
    }

    if (search) {
      filter.$or = [
        { adminName: { $regex: search, $options: "i" } },
        { adminEmail: { $regex: search, $options: "i" } },
        { action: { $regex: search, $options: "i" } },
        { details: { $regex: search, $options: "i" } },
        { module: { $regex: search, $options: "i" } },
      ];
    }

    const total = await AuditLog.countDocuments(filter);

    const logs = await AuditLog.find(filter)
      .sort({ createdAt: -1 })
      .skip((Number(page) - 1) * Number(limit))
      .limit(Number(limit))
      .lean();

    return res.status(200).json({
      success: true,
      data: logs,
      total,
      page: Number(page),
      limit: Number(limit),
      totalPages: Math.ceil(total / Number(limit)) || 1,
    });
  } catch (error) {
    console.error("Get Audit Logs Error:", error);
    return res.status(500).json({ success: false, message: error.message });
  }
};

/**
 * DELETE /api/audit-logs/:id (Super Admin Only)
 */
exports.deleteAuditLog = async (req, res) => {
  try {
    const log = await AuditLog.findByIdAndDelete(req.params.id);
    if (!log) {
      return res.status(404).json({ success: false, message: "Activity log not found" });
    }
    return res.status(200).json({ success: true, message: "Activity log deleted successfully" });
  } catch (error) {
    console.error("Delete Audit Log Error:", error);
    return res.status(500).json({ success: false, message: error.message });
  }
};

/**
 * POST /api/audit-logs/bulk-delete (Super Admin Only)
 */
exports.bulkDeleteAuditLogs = async (req, res) => {
  try {
    const { ids } = req.body;
    if (!ids || !Array.isArray(ids) || ids.length === 0) {
      return res.status(400).json({ success: false, message: "Array of log IDs required" });
    }
    const result = await AuditLog.deleteMany({ _id: { $in: ids } });
    return res.status(200).json({
      success: true,
      message: `${result.deletedCount} activity logs deleted successfully`,
      deletedCount: result.deletedCount,
    });
  } catch (error) {
    console.error("Bulk Delete Audit Logs Error:", error);
    return res.status(500).json({ success: false, message: error.message });
  }
};

/**
 * DELETE /api/audit-logs/clear-all (Super Admin Only)
 */
exports.clearAllAuditLogs = async (req, res) => {
  try {
    const result = await AuditLog.deleteMany({});
    return res.status(200).json({
      success: true,
      message: "All activity logs cleared successfully",
      deletedCount: result.deletedCount,
    });
  } catch (error) {
    console.error("Clear All Audit Logs Error:", error);
    return res.status(500).json({ success: false, message: error.message });
  }
};

exports.createAuditLog = async (req, res) => {
  try {
    const { action, module = "System", details = "", severity = "info", format = "none", metadata = {} } = req.body;
    const log = await logActivity({
      req,
      action,
      module,
      details,
      severity,
      format,
      metadata,
    });

    return res.status(201).json({ success: true, data: log });
  } catch (error) {
    console.error("Create Audit Log Error:", error);
    return res.status(500).json({ success: false, message: error.message });
  }
};

/**
 * GET /api/audit-logs/export/:format (csv | json)
 */
exports.exportAuditLogs = async (req, res) => {
  try {
    const format = (req.params.format || "csv").toLowerCase();
    const tenDaysAgo = new Date(Date.now() - 10 * 24 * 60 * 60 * 1000);
    const logs = await AuditLog.find({ createdAt: { $gte: tenDaysAgo } }).sort({ createdAt: -1 }).limit(1000).lean();

    // Log this export activity into MongoDB!
    await logActivity({
      req,
      action: `Exported Audit Trail (${format.toUpperCase()})`,
      module: "Security & Auth",
      details: `Exported ${logs.length} system audit activity entries in ${format.toUpperCase()} format.`,
      format,
      severity: "info",
      metadata: { count: logs.length, format },
    });

    const dateStr = new Date().toISOString().slice(0, 10);

    if (format === "json") {
      res.setHeader("Content-Type", "application/json; charset=utf-8");
      res.setHeader("Content-Disposition", `attachment; filename="giftfestive-audit-trail-${dateStr}.json"`);
      return res.status(200).send(JSON.stringify(logs, null, 2));
    }

    // Default CSV
    const headers = [
      "Timestamp",
      "Admin Name",
      "Admin Email",
      "Role",
      "Action",
      "Module",
      "Details",
      "Format",
      "Severity",
      "IP Address",
    ];

    const rows = logs.map((log) => [
      escapeCsv(log.createdAt ? new Date(log.createdAt).toISOString() : ""),
      escapeCsv(log.adminName),
      escapeCsv(log.adminEmail),
      escapeCsv(log.adminRole),
      escapeCsv(log.action),
      escapeCsv(log.module),
      escapeCsv(log.details),
      escapeCsv(log.format || "none"),
      escapeCsv(log.severity),
      escapeCsv(log.ipAddress),
    ]);

    const csvContent = "\uFEFF" + [headers.map(escapeCsv).join(","), ...rows.map((r) => r.join(","))].join("\r\n");

    res.setHeader("Content-Type", "text/csv; charset=utf-8");
    res.setHeader("Content-Disposition", `attachment; filename="giftfestive-audit-trail-${dateStr}.csv"`);
    return res.status(200).send(csvContent);
  } catch (error) {
    console.error("Export Audit Logs Error:", error);
    return res.status(500).json({ success: false, message: error.message });
  }
};

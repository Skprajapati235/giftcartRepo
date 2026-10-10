const express = require("express");
const router = express.Router();
const controller = require("../controllers/auditLogController");
const authMiddleware = require("../middleware/authMiddleware");
const adminMiddleware = require("../middleware/adminMiddleware");

const auditView = adminMiddleware.requireRole(["super_admin", "admin"], ["/audit-logs"]);
const superAdminOnly = adminMiddleware.requireRole(["super_admin"]);

router.get("/export/:format", authMiddleware, adminMiddleware, auditView, controller.exportAuditLogs);
router.get("/", authMiddleware, adminMiddleware, auditView, controller.getAuditLogs);
router.post("/", authMiddleware, adminMiddleware, auditView, controller.createAuditLog);

router.delete("/clear-all", authMiddleware, adminMiddleware, superAdminOnly, controller.clearAllAuditLogs);
router.post("/bulk-delete", authMiddleware, adminMiddleware, superAdminOnly, controller.bulkDeleteAuditLogs);
router.delete("/:id", authMiddleware, adminMiddleware, superAdminOnly, controller.deleteAuditLog);

module.exports = router;

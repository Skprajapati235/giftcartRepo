const express = require("express");
const router = express.Router();
const controller = require("../controllers/auditLogController");
const authMiddleware = require("../middleware/authMiddleware");
const adminMiddleware = require("../middleware/adminMiddleware");

router.get("/export/:format", authMiddleware, adminMiddleware, controller.exportAuditLogs);
router.get("/", authMiddleware, adminMiddleware, controller.getAuditLogs);
router.post("/", authMiddleware, adminMiddleware, controller.createAuditLog);

const superAdminOnly = adminMiddleware.requireRole(["super_admin"]);
router.delete("/clear-all", authMiddleware, adminMiddleware, superAdminOnly, controller.clearAllAuditLogs);
router.post("/bulk-delete", authMiddleware, adminMiddleware, superAdminOnly, controller.bulkDeleteAuditLogs);
router.delete("/:id", authMiddleware, adminMiddleware, superAdminOnly, controller.deleteAuditLog);

module.exports = router;

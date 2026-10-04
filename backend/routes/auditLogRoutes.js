const express = require("express");
const router = express.Router();
const controller = require("../controllers/auditLogController");
const authMiddleware = require("../middleware/authMiddleware");
const adminMiddleware = require("../middleware/adminMiddleware");

router.get("/", authMiddleware, adminMiddleware, adminMiddleware.requireRole(["super_admin", "admin"]), controller.getAuditLogs);
router.post("/", authMiddleware, adminMiddleware, controller.createAuditLog);

module.exports = router;

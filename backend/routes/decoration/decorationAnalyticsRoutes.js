const express = require("express");
const router = express.Router();
const { decorationAnalyticsController } = require("../../controllers/decoration");
const adminMiddleware = require("../../middleware/adminMiddleware");

// Catalog / partner / money data: only super admin and admin (or staff given the decoration screen explicitly)
const manage = [adminMiddleware, adminMiddleware.requireRole(["super_admin", "admin"], ["/decoration-panel", "/decorations"])];

// Admin Analytics & Commercials
router.get("/", ...manage, (req, res) => decorationAnalyticsController.getDecorationAnalytics(req, res));

module.exports = router;

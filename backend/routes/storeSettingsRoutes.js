const express = require("express");
const router = express.Router();
const controller = require("../controllers/storeSettingsController");
const authMiddleware = require("../middleware/authMiddleware");
const adminMiddleware = require("../middleware/adminMiddleware");

// Public endpoint to check delivery operating hours and next available time
router.get("/delivery-hours", controller.getDeliveryHours);

// Admin-only endpoint to update delivery operating hours
router.put("/delivery-hours", authMiddleware, adminMiddleware, controller.updateDeliveryHours);

// Public endpoint to fetch storefront theme
router.get("/theme", controller.getStoreTheme);

// Admin-only endpoint to update storefront theme (Super Admin & SEO Specialist only)
router.put("/theme", authMiddleware, adminMiddleware, adminMiddleware.requireRole(["super_admin", "admin", "seo_specialist"]), controller.updateStoreTheme);

module.exports = router;

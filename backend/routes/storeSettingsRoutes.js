const express = require("express");
const router = express.Router();
const controller = require("../controllers/storeSettingsController");
const authMiddleware = require("../middleware/authMiddleware");
const adminMiddleware = require("../middleware/adminMiddleware");

// Public endpoint to check delivery operating hours and next available time
router.get("/delivery-hours", controller.getDeliveryHours);

// Admin-only endpoint to update delivery operating hours
router.put("/delivery-hours", authMiddleware, adminMiddleware, controller.updateDeliveryHours);

module.exports = router;

const express = require("express");
const router = express.Router();
const { decorationAnalyticsController } = require("../../controllers/decoration");
const adminMiddleware = require("../../middleware/adminMiddleware");

// Admin Analytics & Commercials
router.get("/", adminMiddleware, (req, res) => decorationAnalyticsController.getDecorationAnalytics(req, res));

module.exports = router;

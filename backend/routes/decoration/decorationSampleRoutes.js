const express = require("express");
const router = express.Router();
const { decorationSampleController } = require("../../controllers/decoration");
const adminMiddleware = require("../../middleware/adminMiddleware");

// Public Showcase
router.get("/", (req, res) => decorationSampleController.getSamples(req, res));
router.get("/:id", (req, res) => decorationSampleController.getSampleById(req, res));

// Admin CRUD & Storefront Toggle
router.post("/", adminMiddleware, (req, res) => decorationSampleController.createSample(req, res));
router.put("/:id", adminMiddleware, (req, res) => decorationSampleController.updateSample(req, res));
router.delete("/:id", adminMiddleware, (req, res) => decorationSampleController.deleteSample(req, res));
router.patch("/:id/toggle", adminMiddleware, (req, res) => decorationSampleController.toggleSampleStorefront(req, res));

module.exports = router;

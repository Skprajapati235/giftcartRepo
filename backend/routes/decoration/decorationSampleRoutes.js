const express = require("express");
const router = express.Router();
const { decorationSampleController } = require("../../controllers/decoration");
const adminMiddleware = require("../../middleware/adminMiddleware");

// Catalog / partner / money data: only super admin and admin (or staff given the decoration screen explicitly)
const manage = [adminMiddleware, adminMiddleware.requireRole(["super_admin", "admin"], ["/decoration-panel", "/decorations"])];

// Public Showcase
router.get("/", (req, res) => decorationSampleController.getSamples(req, res));
router.get("/:id", (req, res) => decorationSampleController.getSampleById(req, res));

// Admin CRUD & Storefront Toggle
router.post("/", ...manage, (req, res) => decorationSampleController.createSample(req, res));
router.put("/:id", ...manage, (req, res) => decorationSampleController.updateSample(req, res));
router.delete("/:id", ...manage, (req, res) => decorationSampleController.deleteSample(req, res));
router.patch("/:id/toggle", ...manage, (req, res) => decorationSampleController.toggleSampleStorefront(req, res));

module.exports = router;

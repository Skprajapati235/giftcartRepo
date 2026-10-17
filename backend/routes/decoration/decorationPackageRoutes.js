const express = require("express");
const router = express.Router();
const { decorationPackageController } = require("../../controllers/decoration");
const adminMiddleware = require("../../middleware/adminMiddleware");
const optionalAuthMiddleware = require("../../middleware/optionalAuthMiddleware");

// Catalog / partner / money data: only super admin and admin (or staff given the decoration screen explicitly)
const manage = [adminMiddleware, adminMiddleware.requireRole(["super_admin", "admin"], ["/decoration-panel", "/decorations"])];

// Public
router.get("/", optionalAuthMiddleware, (req, res) => decorationPackageController.getPackages(req, res));
router.get("/:slug", optionalAuthMiddleware, (req, res) => decorationPackageController.getPackageBySlug(req, res));

// Admin CRUD
router.post("/", ...manage, (req, res) => decorationPackageController.createPackage(req, res));
router.put("/:id", ...manage, (req, res) => decorationPackageController.updatePackage(req, res));
router.delete("/:id", ...manage, (req, res) => decorationPackageController.deletePackage(req, res));

module.exports = router;

const express = require("express");
const router = express.Router();
const { decorationPackageController } = require("../../controllers/decoration");
const adminMiddleware = require("../../middleware/adminMiddleware");

// Public
router.get("/", (req, res) => decorationPackageController.getPackages(req, res));
router.get("/:slug", (req, res) => decorationPackageController.getPackageBySlug(req, res));

// Admin CRUD
router.post("/", adminMiddleware, (req, res) => decorationPackageController.createPackage(req, res));
router.put("/:id", adminMiddleware, (req, res) => decorationPackageController.updatePackage(req, res));
router.delete("/:id", adminMiddleware, (req, res) => decorationPackageController.deletePackage(req, res));

module.exports = router;

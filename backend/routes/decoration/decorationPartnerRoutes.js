const express = require("express");
const router = express.Router();
const { decorationPartnerController } = require("../../controllers/decoration");
const adminMiddleware = require("../../middleware/adminMiddleware");

// Catalog / partner / money data: only super admin and admin (or staff given the decoration screen explicitly)
const manage = [adminMiddleware, adminMiddleware.requireRole(["super_admin", "admin"], ["/decoration-panel", "/decorations"])];

// Admin Only - Sensitive Partner Business Data & Contact Info
router.get("/", ...manage, (req, res) => decorationPartnerController.getDecoratorPartners(req, res));
router.get("/:id", ...manage, (req, res) => decorationPartnerController.getDecoratorPartnerById(req, res));

// Admin CRUD
router.post("/", ...manage, (req, res) => decorationPartnerController.createDecoratorPartner(req, res));
router.put("/:id", ...manage, (req, res) => decorationPartnerController.updateDecoratorPartner(req, res));
router.delete("/:id", ...manage, (req, res) => decorationPartnerController.deleteDecoratorPartner(req, res));

module.exports = router;

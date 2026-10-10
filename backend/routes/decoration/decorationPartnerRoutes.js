const express = require("express");
const router = express.Router();
const { decorationPartnerController } = require("../../controllers/decoration");
const adminMiddleware = require("../../middleware/adminMiddleware");

// Admin Only - Sensitive Partner Business Data & Contact Info
router.get("/", adminMiddleware, (req, res) => decorationPartnerController.getDecoratorPartners(req, res));
router.get("/:id", adminMiddleware, (req, res) => decorationPartnerController.getDecoratorPartnerById(req, res));

// Admin CRUD
router.post("/", adminMiddleware, (req, res) => decorationPartnerController.createDecoratorPartner(req, res));
router.put("/:id", adminMiddleware, (req, res) => decorationPartnerController.updateDecoratorPartner(req, res));
router.delete("/:id", adminMiddleware, (req, res) => decorationPartnerController.deleteDecoratorPartner(req, res));

module.exports = router;

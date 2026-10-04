const express = require("express");
const router = express.Router();
const controller = require("../controllers/deliveryRiderController");
const authMiddleware = require("../middleware/authMiddleware");
const adminMiddleware = require("../middleware/adminMiddleware");

router.get("/", authMiddleware, adminMiddleware, controller.getAllRiders);
router.post("/", authMiddleware, adminMiddleware, adminMiddleware.requireRole(["super_admin", "admin", "delivery_coordinator"]), controller.createRider);
router.put("/assign", authMiddleware, adminMiddleware, adminMiddleware.requireRole(["super_admin", "admin", "delivery_coordinator"]), controller.assignRiderToOrder);
router.put("/:id/status", authMiddleware, adminMiddleware, controller.updateRiderStatus);

module.exports = router;

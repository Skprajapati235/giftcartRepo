const express = require("express");
const router = express.Router();
const controller = require("../controllers/deliverySlotController");
const adminMiddleware = require("../middleware/adminMiddleware");

const slotManage = adminMiddleware.requireRole(
  ["super_admin", "admin", "delivery_coordinator"],
  ["/delivery-slots", "/delivery-hours"]
);

router.get("/", controller.getDeliverySlots);
router.get("/availability", controller.getAvailability);
router.post("/", adminMiddleware, slotManage, controller.createDeliverySlot);
router.put("/:id", adminMiddleware, slotManage, controller.updateDeliverySlot);
router.delete("/:id", adminMiddleware, slotManage, controller.deleteDeliverySlot);

module.exports = router;

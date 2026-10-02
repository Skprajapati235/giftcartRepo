const express = require("express");
const router = express.Router();
const controller = require("../controllers/deliverySlotController");
const adminMiddleware = require("../middleware/adminMiddleware");

router.get("/", controller.getDeliverySlots);
router.post("/", adminMiddleware, controller.createDeliverySlot);
router.put("/:id", adminMiddleware, controller.updateDeliverySlot);
router.delete("/:id", adminMiddleware, controller.deleteDeliverySlot);

module.exports = router;

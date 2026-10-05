// const express = require("express");
// const router = express.Router();
// const controller = require("../controllers/deliveryRiderController");
// const authMiddleware = require("../middleware/authMiddleware");
// const adminMiddleware = require("../middleware/adminMiddleware");

// router.get("/", authMiddleware, adminMiddleware, controller.getAllRiders);
// router.post("/", authMiddleware, adminMiddleware, adminMiddleware.requireRole(["super_admin", "admin", "delivery_coordinator"]), controller.createRider);
// router.put("/assign", authMiddleware, adminMiddleware, adminMiddleware.requireRole(["super_admin", "admin", "delivery_coordinator"]), controller.assignRiderToOrder);
// router.put("/:id/status", authMiddleware, adminMiddleware, controller.updateRiderStatus);

// module.exports = router;


const express = require("express");
const router = express.Router();
const controller = require("../controllers/deliveryRiderController");
const authMiddleware = require("../middleware/authMiddleware");
const adminMiddleware = require("../middleware/adminMiddleware");

const fleetRoles = adminMiddleware.requireRole(["super_admin", "admin", "delivery_coordinator"]);

router.get("/", authMiddleware, adminMiddleware, fleetRoles, controller.getAllRiders);
router.get("/dispatch-orders", authMiddleware, adminMiddleware, fleetRoles, controller.getDispatchOrders);
router.post("/", authMiddleware, adminMiddleware, fleetRoles, controller.createRider);
router.put("/assign", authMiddleware, adminMiddleware, fleetRoles, controller.assignRiderToOrder);
router.put("/unassign", authMiddleware, adminMiddleware, fleetRoles, controller.unassignRider);
router.put("/dispatch", authMiddleware, adminMiddleware, fleetRoles, controller.dispatchOrder);
router.put("/complete", authMiddleware, adminMiddleware, fleetRoles, controller.completeDelivery);
router.put("/:id/status", authMiddleware, adminMiddleware, fleetRoles, controller.updateRiderStatus);

module.exports = router;

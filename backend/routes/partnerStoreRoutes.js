const express = require("express");
const router = express.Router();
const controller = require("../controllers/partnerStoreController");
const adminMiddleware = require("../middleware/adminMiddleware");

// Role checker for Partner Stores management
const storeManage = adminMiddleware.requireRole
  ? adminMiddleware.requireRole(
      ["super_admin", "admin", "kitchen_manager", "delivery_coordinator"],
      ["/stores"]
    )
  : (req, res, next) => next();

// Public / Authenticated read routes
router.get("/", controller.getAllStores);
router.get("/:id", controller.getStoreById);

// Admin-protected mutation routes
router.post("/", adminMiddleware, storeManage, controller.createStore);
router.put("/:id", adminMiddleware, storeManage, controller.updateStore);
router.patch("/:id/toggle-status", adminMiddleware, storeManage, controller.toggleStoreStatus);
router.delete("/:id", adminMiddleware, storeManage, controller.deleteStore);

module.exports = router;

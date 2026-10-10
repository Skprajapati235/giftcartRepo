const express = require("express");
const router = express.Router();
const controller = require("../controllers/addonController");
const adminMiddleware = require("../middleware/adminMiddleware");

const addonManage = adminMiddleware.requireRole(
  ["super_admin", "admin", "kitchen_manager"],
  ["/addons"]
);

router.get("/", controller.getAddons);
router.post("/", adminMiddleware, addonManage, controller.createAddon);
router.put("/:id", adminMiddleware, addonManage, controller.updateAddon);
router.delete("/:id", adminMiddleware, addonManage, controller.deleteAddon);

module.exports = router;

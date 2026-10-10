const express = require("express");
const router = express.Router();
const controller = require("../controllers/addonCategoryController");
const adminMiddleware = require("../middleware/adminMiddleware");

const addonManage = adminMiddleware.requireRole(
  ["super_admin", "admin", "kitchen_manager"],
  ["/addons"]
);

router.get("/", adminMiddleware, addonManage, controller.getAll);
router.post("/", adminMiddleware, addonManage, controller.create);
router.put("/:id", adminMiddleware, addonManage, controller.update);
router.delete("/:id", adminMiddleware, addonManage, controller.remove);

module.exports = router;

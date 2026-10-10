const express = require("express");
const router = express.Router();
const controller = require("../controllers/flavorController");
const adminMiddleware = require("../middleware/adminMiddleware");

const flavorManage = adminMiddleware.requireRole(
  ["super_admin", "admin", "kitchen_manager"],
  ["/flavors"]
);

router.post("/", adminMiddleware, flavorManage, controller.create);
router.get("/", controller.getAll);
router.put("/:id", adminMiddleware, flavorManage, controller.update);
router.delete("/:id", adminMiddleware, flavorManage, controller.delete);

module.exports = router;

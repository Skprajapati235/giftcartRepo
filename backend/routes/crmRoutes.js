const express = require("express");
const router = express.Router();
const controller = require("../controllers/crmController");

const adminMiddleware = require("../middleware/adminMiddleware");

const crmManage = adminMiddleware.requireRole(
  ["super_admin", "admin", "support_agent"],
  ["/crm"]
);

router.post("/", adminMiddleware, crmManage, controller.create);
router.get("/", adminMiddleware, crmManage, controller.getAll);
router.get("/:id", adminMiddleware, crmManage, controller.getById);
router.put("/:id", adminMiddleware, crmManage, controller.update);
router.delete("/:id", adminMiddleware, crmManage, controller.delete);

module.exports = router;

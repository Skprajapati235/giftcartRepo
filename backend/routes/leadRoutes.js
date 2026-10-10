const express = require("express");
const router = express.Router();
const controller = require("../controllers/leadController");

const adminMiddleware = require("../middleware/adminMiddleware");

const leadManage = adminMiddleware.requireRole(
  ["super_admin", "admin", "support_agent"],
  ["/leads"]
);

router.post("/", controller.create);
router.get("/", adminMiddleware, leadManage, controller.getAll);
router.get("/:id", adminMiddleware, leadManage, controller.getById);
router.put("/:id", adminMiddleware, leadManage, controller.update);
router.delete("/:id", adminMiddleware, leadManage, controller.delete);

module.exports = router;

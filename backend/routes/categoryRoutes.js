const router = require("express").Router();
const controller = require("../controllers/categoryController");
const adminMiddleware = require("../middleware/adminMiddleware");

const categoryManage = adminMiddleware.requireRole(
  ["super_admin", "admin", "kitchen_manager"],
  ["/category"]
);

router.post("/", adminMiddleware, categoryManage, controller.create);
router.get("/", controller.getAll);
router.get("/:id", controller.getOne);
router.put("/:id", adminMiddleware, categoryManage, controller.update);
router.delete("/:id", adminMiddleware, categoryManage, controller.delete);

module.exports = router;
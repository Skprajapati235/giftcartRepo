const router = require("express").Router();
const controller = require("../controllers/productController");
const adminMiddleware = require("../middleware/adminMiddleware");

const productManage = adminMiddleware.requireRole(
  ["super_admin", "admin", "kitchen_manager"],
  ["/products"]
);

router.post("/", adminMiddleware, productManage, controller.create);
router.get("/", controller.getAll);
router.get("/export/:format", adminMiddleware, productManage, controller.exportProducts);
router.get("/:id", controller.getOne);
router.put("/:id", adminMiddleware, productManage, controller.update);
router.delete("/:id", adminMiddleware, productManage, controller.delete);

module.exports = router;

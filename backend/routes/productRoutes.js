const router = require("express").Router();
const controller = require("../controllers/productController");
const adminMiddleware = require("../middleware/adminMiddleware");

const productManage = adminMiddleware.requireRole(["super_admin", "admin", "kitchen_manager"]);

router.post("/", adminMiddleware, productManage, (req, res, next) => {
  console.log(`[Product Request] POST ${req.url}`, JSON.stringify(req.body, null, 2));
  next();
}, controller.create);

router.get("/", controller.getAll);
router.get("/:id", controller.getOne);

router.put("/:id", adminMiddleware, productManage, (req, res, next) => {
  console.log(`[Product Request] PUT ${req.url}`, JSON.stringify(req.body, null, 2));
  next();
}, controller.update);

router.delete("/:id", adminMiddleware, productManage, controller.delete);

module.exports = router;

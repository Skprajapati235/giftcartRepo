const router = require("express").Router();
const controller = require("../controllers/productController");
const adminMiddleware = require("../middleware/adminMiddleware");

router.post("/", adminMiddleware, controller.create);
router.get("/", controller.getAll);
router.get("/:id", controller.getOne);
router.put("/:id", adminMiddleware, controller.update);
router.delete("/:id", adminMiddleware, controller.delete);

module.exports = router;

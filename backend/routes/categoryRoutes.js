const router = require("express").Router();
const controller = require("../controllers/categoryController");
const adminMiddleware = require("../middleware/adminMiddleware");

router.post("/", adminMiddleware, controller.create);
router.get("/", controller.getAll);
router.put("/:id", adminMiddleware, controller.update);
router.delete("/:id", adminMiddleware, controller.delete);

module.exports = router;
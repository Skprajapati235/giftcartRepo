const router = require("express").Router();
const controller = require("../controllers/cityController");
const adminMiddleware = require("../middleware/adminMiddleware");

const cityManage = adminMiddleware.requireRole(
  ["super_admin", "admin", "delivery_coordinator"],
  ["/cities"]
);

router.post("/", adminMiddleware, cityManage, controller.create);
router.get("/", controller.getAll);
router.put("/:id", adminMiddleware, cityManage, controller.update);
router.delete("/:id", adminMiddleware, cityManage, controller.delete);

module.exports = router;

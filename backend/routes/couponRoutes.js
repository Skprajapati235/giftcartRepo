const router = require("express").Router();
const controller = require("../controllers/couponController");
const adminMiddleware = require("../middleware/adminMiddleware");
const optionalAuthMiddleware = require("../middleware/optionalAuthMiddleware");

// Public/User routes
router.post("/validate", optionalAuthMiddleware, controller.validate);
router.get("/active", optionalAuthMiddleware, controller.getActive);

// Admin routes
const couponManage = adminMiddleware.requireRole(
  ["super_admin", "admin", "seo_specialist"],
  ["/coupons"]
);

router.post("/", adminMiddleware, couponManage, controller.create);
router.get("/", adminMiddleware, couponManage, controller.getAll);
router.put("/:id", adminMiddleware, couponManage, controller.update);
router.delete("/:id", adminMiddleware, couponManage, controller.delete);

module.exports = router;

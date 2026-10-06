const router = require("express").Router();
const controller = require("../controllers/couponController");
const adminMiddleware = require("../middleware/adminMiddleware");
const optionalAuthMiddleware = require("../middleware/optionalAuthMiddleware");

// Public/User routes
router.post("/validate", optionalAuthMiddleware, controller.validate);
router.get("/active", optionalAuthMiddleware, controller.getActive);

// Admin routes
router.post("/", adminMiddleware, controller.create);
router.get("/", adminMiddleware, controller.getAll);
router.put("/:id", adminMiddleware, controller.update);
router.delete("/:id", adminMiddleware, controller.delete);

module.exports = router;

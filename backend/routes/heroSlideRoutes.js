const express = require("express");
const router = express.Router();
const controller = require("../controllers/heroSlideController");
const adminMiddleware = require("../middleware/adminMiddleware");

// Public access for mobile & web apps, supports admin query parameters as well
router.get("/", controller.getAll);

// Admin-only management endpoints
const slideManage = adminMiddleware.requireRole(
  ["super_admin", "admin", "seo_specialist"],
  ["/hero-slides"]
);

router.post("/", adminMiddleware, slideManage, controller.create);
router.put("/:id", adminMiddleware, slideManage, controller.update);
router.delete("/:id", adminMiddleware, slideManage, controller.delete);

module.exports = router;

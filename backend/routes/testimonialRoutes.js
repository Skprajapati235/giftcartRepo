const express = require("express");
const router = express.Router();
const controller = require("../controllers/testimonialController");
const adminMiddleware = require("../middleware/adminMiddleware");

// Public endpoints
router.get("/", controller.getAll);
router.get("/:id", controller.getById);
router.post("/submit", controller.create);
router.post("/public", controller.create);

// Admin-only management endpoints
const testimonialManage = adminMiddleware.requireRole(
  ["super_admin", "admin", "seo_specialist"],
  ["/testimonials"]
);

router.post("/", adminMiddleware, testimonialManage, controller.create);
router.post("/bulk-delete", adminMiddleware, testimonialManage, controller.bulkDelete);
router.put("/reorder", adminMiddleware, testimonialManage, controller.reorder);
router.put("/:id", adminMiddleware, testimonialManage, controller.update);
router.patch("/:id/status", adminMiddleware, testimonialManage, controller.updateStatus);
router.delete("/:id", adminMiddleware, testimonialManage, controller.delete);

module.exports = router;

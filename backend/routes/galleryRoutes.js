const express = require("express");
const router = express.Router();
const controller = require("../controllers/galleryController");
const adminMiddleware = require("../middleware/adminMiddleware");

const galleryManage = adminMiddleware.requireRole(
  ["super_admin", "admin", "seo_specialist"],
  ["/gallery"]
);

// Settings & Layout endpoints
router.get("/settings", controller.getSettings);
router.put("/settings", adminMiddleware, galleryManage, controller.updateSettings);

// Public endpoints
router.get("/", controller.getAll);
router.get("/categories", controller.getCategories);
router.post("/:id/like", controller.like);
router.get("/:id", controller.getById);

// Admin-only management endpoints
router.post("/", adminMiddleware, galleryManage, controller.create);
router.post("/bulk-delete", adminMiddleware, galleryManage, controller.bulkDelete);
router.put("/reorder", adminMiddleware, galleryManage, controller.reorder);
router.put("/:id", adminMiddleware, galleryManage, controller.update);
router.patch("/:id/status", adminMiddleware, galleryManage, controller.updateStatus);
router.delete("/:id", adminMiddleware, galleryManage, controller.delete);

module.exports = router;

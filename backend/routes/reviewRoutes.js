const router = require("express").Router();
const controller = require("../controllers/reviewController");
const authMiddleware = require("../middleware/authMiddleware");
const adminMiddleware = require("../middleware/adminMiddleware");

// Public routes
router.get("/product/:productId", controller.getProductReviews);

// User routes (Authenticated)
router.post("/product/:productId", authMiddleware, controller.createReview);
router.put("/:id", authMiddleware, controller.updateReview);
router.delete("/:id", authMiddleware, controller.deleteReview);

// Admin routes
const reviewManage = adminMiddleware.requireRole(
  ["super_admin", "admin", "support_agent"],
  ["/reviews"]
);

router.get("/admin/all", adminMiddleware, reviewManage, controller.getAllReviews);
router.post("/admin/bulk-delete", adminMiddleware, reviewManage, controller.adminBulkDeleteReviews);
router.get("/admin/:id", adminMiddleware, reviewManage, controller.getReviewById);
router.post("/admin/reply/:id", adminMiddleware, reviewManage, controller.adminReplyReview);
router.put("/admin/status/:id", adminMiddleware, reviewManage, controller.updateReviewStatus);
router.delete("/admin/:id", adminMiddleware, reviewManage, controller.adminDeleteReview);

// Social routes
router.post("/:id/like", authMiddleware, controller.toggleLike);
router.post("/:id/dislike", authMiddleware, controller.toggleDislike);

module.exports = router;

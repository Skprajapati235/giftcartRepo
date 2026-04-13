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
router.get("/admin/all", adminMiddleware, controller.getAllReviews);
router.get("/admin/:id", adminMiddleware, controller.getReviewById);
router.post("/admin/reply/:id", adminMiddleware, controller.adminReplyReview);
router.put("/admin/status/:id", adminMiddleware, controller.adminUpdateReviewStatus);
router.delete("/admin/:id", adminMiddleware, controller.adminDeleteReview);

// Social routes
router.post("/:id/like", authMiddleware, controller.toggleLike);
router.post("/:id/dislike", authMiddleware, controller.toggleDislike);

module.exports = router;

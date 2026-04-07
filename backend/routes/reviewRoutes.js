const router = require("express").Router();
const controller = require("../controllers/reviewController");
const authMiddleware = require("../middleware/authMiddleware");
const adminMiddleware = require("../middleware/adminMiddleware");

router.get("/product/:productId/eligible", authMiddleware, controller.getReviewEligibility);
router.get("/product/:productId", controller.getProductReviews);
router.post("/", authMiddleware, controller.createReview);
router.put("/:id", authMiddleware, controller.updateReview);
router.delete("/:id", authMiddleware, controller.deleteReview);
router.get("/user", authMiddleware, controller.getUserReviews);

router.get("/admin/all", authMiddleware, adminMiddleware, controller.getAllReviews);
router.get("/admin/:id", authMiddleware, adminMiddleware, controller.getReviewById);
router.put("/admin/:id", authMiddleware, adminMiddleware, controller.updateReviewByAdmin);
router.put("/admin/:id/reply", authMiddleware, adminMiddleware, controller.replyReview);
router.delete("/admin/:id", authMiddleware, adminMiddleware, controller.deleteReview);

module.exports = router;

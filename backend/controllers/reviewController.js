const reviewService = require("../services/reviewService");
const productService = require("../services/productService");

exports.getProductReviews = async (req, res) => {
  try {
    const data = await reviewService.getProductReviews(req.params.id);
    res.json(data);
  } catch (error) {
    console.error("Get Product Reviews Error:", error);
    res.status(error.statusCode || 500).json({ success: false, message: error.message || "Error fetching reviews" });
  }
};

exports.getReviewEligibility = async (req, res) => {
  try {
    const data = await reviewService.getReviewEligibility(req.user.id, req.params.productId);
    res.json(data);
  } catch (error) {
    console.error("Check review eligibility error:", error);
    res.status(error.statusCode || 500).json({ success: false, message: error.message || "Error checking eligibility" });
  }
};

exports.createReview = async (req, res) => {
  try {
    const { productId, orderId, rating, comment, images } = req.body;
    const review = await reviewService.createReview({
      userId: req.user.id,
      productId,
      orderId,
      rating,
      comment,
      images,
    });
    res.status(201).json(review);
  } catch (error) {
    console.error("Create review error:", error);
    res.status(error.statusCode || 500).json({ success: false, message: error.message || "Error creating review" });
  }
};

exports.updateReview = async (req, res) => {
  try {
    const review = await reviewService.updateReview(req.params.id, req.user.id, req.body);
    res.json(review);
  } catch (error) {
    console.error("Update review error:", error);
    res.status(error.statusCode || 500).json({ success: false, message: error.message || "Error updating review" });
  }
};

exports.deleteReview = async (req, res) => {
  try {
    await reviewService.deleteReview(req.params.id, req.user.id);
    res.json({ success: true, message: "Review deleted" });
  } catch (error) {
    console.error("Delete review error:", error);
    res.status(error.statusCode || 500).json({ success: false, message: error.message || "Error deleting review" });
  }
};

exports.getUserReviews = async (req, res) => {
  try {
    const reviews = await reviewService.getUserReviews(req.user.id);
    res.json(reviews);
  } catch (error) {
    console.error("Get user reviews error:", error);
    res.status(error.statusCode || 500).json({ success: false, message: error.message || "Error fetching your reviews" });
  }
};

exports.getAllReviews = async (req, res) => {
  try {
    const reviews = await reviewService.getAllReviews();
    res.json(reviews);
  } catch (error) {
    console.error("Get all reviews error:", error);
    res.status(error.statusCode || 500).json({ success: false, message: error.message || "Error fetching reviews" });
  }
};

exports.getReviewById = async (req, res) => {
  try {
    const review = await reviewService.getReviewById(req.params.id);
    if (!review) return res.status(404).json({ message: "Review not found" });
    res.json(review);
  } catch (error) {
    console.error("Get review detail error:", error);
    res.status(error.statusCode || 500).json({ success: false, message: error.message || "Error fetching review detail" });
  }
};

exports.replyReview = async (req, res) => {
  try {
    const review = await reviewService.replyReview(req.params.id, req.body.message);
    res.json(review);
  } catch (error) {
    console.error("Reply review error:", error);
    res.status(error.statusCode || 500).json({ success: false, message: error.message || "Error sending reply" });
  }
};

exports.updateReviewByAdmin = async (req, res) => {
  try {
    const review = await reviewService.updateReviewByAdmin(req.params.id, req.body);
    res.json(review);
  } catch (error) {
    console.error("Admin update review error:", error);
    res.status(error.statusCode || 500).json({ success: false, message: error.message || "Error updating review" });
  }
};

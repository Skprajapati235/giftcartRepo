const service = require("../services/reviewService");

exports.createReview = async (req, res) => {
  try {
    const data = await service.createReview(req.user.id, req.params.productId, req.body);
    res.status(201).json(data);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
};

exports.getProductReviews = async (req, res) => {
  try {
    const data = await service.getProductReviews(req.params.productId);
    res.json(data);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
};

exports.updateReview = async (req, res) => {
  try {
    const isAdmin = req.user.role === "admin";
    const data = await service.updateReview(req.params.id, req.user.id, req.body, isAdmin);
    res.json(data);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
};

exports.deleteReview = async (req, res) => {
  try {
    await service.deleteReview(req.params.id, req.user.id);
    res.json({ message: "Deleted" });
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
};

// Admin Controllers
exports.getAllReviews = async (req, res) => {
  try {
    const data = await service.getAllReviews();
    res.json(data);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
};

exports.getReviewById = async (req, res) => {
  try {
    const data = await service.getReviewById(req.params.id);
    res.json(data);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
};

exports.adminReplyReview = async (req, res) => {
  try {
    const data = await service.adminReplyReview(req.params.id, req.body.reply);
    res.json(data);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
};

exports.adminUpdateReviewStatus = async (req, res) => {
  try {
    const data = await service.adminUpdateReviewStatus(req.params.id, req.body.status);
    res.json(data);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
};

exports.adminDeleteReview = async (req, res) => {
  try {
    await service.adminDeleteReview(req.params.id);
    res.json({ message: "Deleted by admin" });
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
};

exports.toggleLike = async (req, res) => {
  try {
    const data = await service.toggleLike(req.params.id, req.user.id);
    res.json(data);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
};

exports.toggleDislike = async (req, res) => {
  try {
    const data = await service.toggleDislike(req.params.id, req.user.id);
    res.json(data);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
};

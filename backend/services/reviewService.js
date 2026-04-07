const mongoose = require("mongoose");
const Review = require("../models/Review");
const Order = require("../models/Order");

exports.getProductReviews = async (productId) => {
  const reviews = await Review.find({ product: productId })
    .populate("user", "name email city state")
    .sort({ createdAt: -1 });

  const summary = await Review.aggregate([
    { $match: { product: new mongoose.Types.ObjectId(productId) } },
    {
      $group: {
        _id: "$product",
        totalReviews: { $sum: 1 },
        averageRating: { $avg: "$rating" },
      },
    },
  ]);

  return {
    averageRating: summary[0]?.averageRating ? Number(summary[0].averageRating.toFixed(1)) : 0,
    totalReviews: summary[0]?.totalReviews || 0,
    reviews,
  };
};

exports.getReviewEligibility = async (userId, productId) => {
  const deliveredOrder = await Order.findOne({
    user: userId,
    status: "Delivered",
    "items.product": productId,
  });

  const existingReview = await Review.findOne({ user: userId, product: productId }).populate(
    "order",
    "status"
  );

  return {
    eligible: Boolean(deliveredOrder),
    existingReview,
    deliveredOrderId: deliveredOrder?._id || null,
  };
};

exports.createReview = async ({ userId, productId, orderId, rating, comment, images = [] }) => {
  const order = await Order.findOne({ _id: orderId, user: userId, status: "Delivered", "items.product": productId });
  if (!order) {
    const error = new Error("Review can only be submitted for delivered orders containing this product.");
    error.statusCode = 400;
    throw error;
  }

  if (images.length > 3) {
    const error = new Error("A maximum of 3 review images is allowed.");
    error.statusCode = 400;
    throw error;
  }

  const review = new Review({
    user: userId,
    product: productId,
    order: orderId,
    rating,
    comment,
    images,
  });

  return await review.save();
};

exports.updateReview = async (reviewId, userId, data) => {
  const review = await Review.findOne({ _id: reviewId, user: userId });
  if (!review) {
    const error = new Error("Review not found or you do not have permission to edit it.");
    error.statusCode = 404;
    throw error;
  }

  if (data.images && data.images.length > 3) {
    const error = new Error("A maximum of 3 review images is allowed.");
    error.statusCode = 400;
    throw error;
  }

  review.rating = data.rating !== undefined ? data.rating : review.rating;
  review.comment = data.comment !== undefined ? data.comment : review.comment;
  review.images = data.images !== undefined ? data.images : review.images;

  return await review.save();
};

exports.deleteReview = async (reviewId, userId, isAdmin = false) => {
  const query = isAdmin ? { _id: reviewId } : { _id: reviewId, user: userId };
  const review = await Review.findOne(query);
  if (!review) {
    const error = new Error("Review not found or you do not have permission to delete it.");
    error.statusCode = 404;
    throw error;
  }

  return await Review.deleteOne({ _id: review._id });
};

exports.getUserReviews = async (userId) => {
  return await Review.find({ user: userId })
    .populate("product", "name image")
    .sort({ createdAt: -1 });
};

exports.getAllReviews = async () => {
  return await Review.find()
    .populate("user", "name email city state")
    .populate("product", "name image")
    .sort({ createdAt: -1 });
};

exports.getReviewById = async (id) => {
  return await Review.findById(id)
    .populate("user", "name email mobileNumber city state")
    .populate("product", "name image")
    .populate("order", "status createdAt");
};

exports.replyReview = async (id, message) => {
  const review = await Review.findById(id);
  if (!review) {
    const error = new Error("Review not found.");
    error.statusCode = 404;
    throw error;
  }

  review.adminReply = { message, repliedAt: new Date() };
  return await review.save();
};

exports.updateReviewByAdmin = async (id, data) => {
  const review = await Review.findById(id);
  if (!review) {
    const error = new Error("Review not found.");
    error.statusCode = 404;
    throw error;
  }

  if (data.images && data.images.length > 3) {
    const error = new Error("A maximum of 3 review images is allowed.");
    error.statusCode = 400;
    throw error;
  }

  review.rating = data.rating !== undefined ? data.rating : review.rating;
  review.comment = data.comment !== undefined ? data.comment : review.comment;
  review.images = data.images !== undefined ? data.images : review.images;

  return await review.save();
};

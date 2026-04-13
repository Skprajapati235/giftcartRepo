const Review = require("../models/Review");
const Product = require("../models/Product");
const notificationService = require("./notificationService");

exports.createReview = async (userId, productId, data) => {
  const { rating, comment, images } = data;
  
  const review = await Review.create({
    user: userId,
    product: productId,
    rating,
    comment,
    images: images || [],
  });

  // Create Notification for admin
  await notificationService.createNotification({
    type: "review",
    message: "A new review is pending approval",
    link: "/reviews",
  });

  // Update Product stats explicitly only checking approved
  await updateProductReviewStats(productId);

  return review;
};

async function updateProductReviewStats(productId) {
  const product = await Product.findById(productId);
  if (product) {
    const reviews = await Review.find({ product: productId, status: "approved" });
    if (reviews.length > 0) {
      product.numReviews = reviews.length;
      product.ratings = reviews.reduce((acc, item) => item.rating + acc, 0) / reviews.length;
    } else {
      product.numReviews = 0;
      product.ratings = 0;
    }
    await product.save();
  }
}

exports.getProductReviews = async (productId) => {
  return await Review.find({ product: productId, status: "approved" })
    .populate("user", "name email profilePic")
    .sort({ createdAt: -1 });
};

exports.updateReview = async (reviewId, userId, data, isAdmin = false) => {
  const { rating, comment, images } = data;
  
  let review;
  if (isAdmin) {
    review = await Review.findById(reviewId);
  } else {
    review = await Review.findOne({ _id: reviewId, user: userId });
  }
  
  if (!review) throw new Error("Review not found or not authorized");

  review.rating = rating || review.rating;
  review.comment = comment || review.comment;
  if (images) review.images = images;
  
  await review.save();

  // Update Product stats
  await updateProductReviewStats(review.product);

  return review;
};

exports.deleteReview = async (reviewId, userId) => {
  const review = await Review.findOne({ _id: reviewId, user: userId });
  if (!review) throw new Error("Review not found or not authorized");

  const productId = review.product;
  await Review.findByIdAndDelete(reviewId);

  // Update Product stats
  await updateProductReviewStats(productId);

  return { message: "Review deleted" };
};

// Admin Services
exports.getAllReviews = async () => {
  return await Review.find()
    .populate("user", "name email profilePic")
    .populate("product", "name image price")
    .sort({ createdAt: -1 });
};

exports.getReviewById = async (reviewId) => {
  return await Review.findById(reviewId)
    .populate("user", "name email profilePic")
    .populate("product", "name image price");
};

exports.adminUpdateReview = async (reviewId, data) => {
  return await exports.updateReview(reviewId, null, data, true);
};

exports.adminReplyReview = async (reviewId, reply) => {
  return await Review.findByIdAndUpdate(
    reviewId, 
    { reply, replyAt: Date.now() }, 
    { new: true }
  );
};

exports.adminDeleteReview = async (reviewId) => {
  const review = await Review.findById(reviewId);
  if (!review) throw new Error("Review not found");

  const productId = review.product;
  await Review.findByIdAndDelete(reviewId);

  // Update Product stats
  await updateProductReviewStats(productId);
  return { message: "Review deleted by admin" };
};

exports.adminUpdateReviewStatus = async (reviewId, status) => {
  const review = await Review.findById(reviewId);
  if (!review) throw new Error("Review not found");
  
  review.status = status;
  await review.save();
  
  await updateProductReviewStats(review.product);
  return review;
};

exports.toggleLike = async (reviewId, userId) => {
  const review = await Review.findById(reviewId);
  if (!review) throw new Error("Review not found");

  const hasLiked = review.likes.includes(userId);
  const hasDisliked = review.dislikes.includes(userId);

  if (hasLiked) {
    review.likes = review.likes.filter((id) => id.toString() !== userId);
  } else {
    review.likes.push(userId);
    // Remove from dislikes if present
    review.dislikes = review.dislikes.filter((id) => id.toString() !== userId);
  }

  await review.save();
  return review;
};

exports.toggleDislike = async (reviewId, userId) => {
  const review = await Review.findById(reviewId);
  if (!review) throw new Error("Review not found");

  const hasLiked = review.likes.includes(userId);
  const hasDisliked = review.dislikes.includes(userId);

  if (hasDisliked) {
    review.dislikes = review.dislikes.filter((id) => id.toString() !== userId);
  } else {
    review.dislikes.push(userId);
    // Remove from likes if present
    review.likes = review.likes.filter((id) => id.toString() !== userId);
  }

  await review.save();
  return review;
};

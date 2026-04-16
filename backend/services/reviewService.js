const Review = require("../models/Review");
const Product = require("../models/Product");
const User = require("../models/User");

exports.createReview = async (userId, productId, data) => {
  const { rating, comment, images } = data;
  
  const review = await Review.create({
    user: userId,
    product: productId,
    rating,
    comment,
    images: images || [],
    status: 'pending' // Default is pending anyway, but being explicit
  });

  // Since it's pending, we don't update product ratings yet
  // If the admin wants to approve it, the status change will trigger rating update

  return review;
};

exports.getProductReviews = async (productId, { page = 1, limit = 10 } = {}) => {
  const skip = (page - 1) * limit;
  const reviews = await Review.find({ product: productId, status: "approved" })
    .populate("user", "name email profilePic")
    .sort({ createdAt: -1 })
    .skip(skip)
    .limit(limit);

  const total = await Review.countDocuments({ product: productId, status: "approved" });

  return {
    data: reviews,
    total,
    page: Number(page),
    totalPages: Math.ceil(total / limit),
  };
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

  // Recalculate Product stats (only approved)
  const product = await Product.findById(review.product);
  if (product) {
      const approvedReviews = await Review.find({ product: review.product, status: "approved" });
      product.numReviews = approvedReviews.length;
      product.ratings = approvedReviews.length > 0 
        ? approvedReviews.reduce((acc, item) => item.rating + acc, 0) / approvedReviews.length 
        : 0;
      await product.save();
  }

  return review;
};

exports.updateReviewStatus = async (reviewId, status) => {
    const review = await Review.findByIdAndUpdate(reviewId, { status }, { new: true });
    if (!review) throw new Error("Review not found");
    
    // Recalculate product ratings (only approved reviews)
    const productId = review.product;
    const product = await Product.findById(productId);
    if (product) {
      const approvedReviews = await Review.find({ product: productId, status: "approved" });
      product.numReviews = approvedReviews.length;
      product.ratings = approvedReviews.length > 0 
        ? approvedReviews.reduce((acc, item) => item.rating + acc, 0) / approvedReviews.length 
        : 0;
      await product.save();
    }
    
    return review;
  };

exports.deleteReview = async (reviewId, userId) => {
  const review = await Review.findOne({ _id: reviewId, user: userId });
  if (!review) throw new Error("Review not found or not authorized");

  const productId = review.product;
  await Review.findByIdAndDelete(reviewId);

  // Update Product stats (only approved)
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

  return { message: "Review deleted" };
};

// Admin Services
exports.getAllReviews = async ({ page = 1, limit = 10, search = "" } = {}) => {
  const skip = (page - 1) * limit;
  let query = {};

  if (search) {
     const products = await Product.find({ name: { $regex: search, $options: "i" } }).select('_id');
     const users = await User.find({ 
       $or: [
         { name: { $regex: search, $options: "i" } },
         { email: { $regex: search, $options: "i" } }
       ] 
     }).select('_id');

     query = {
       $or: [
         { comment: { $regex: search, $options: "i" } },
         { product: { $in: products.map(p => p._id) } },
         { user: { $in: users.map(u => u._id) } }
       ]
     };
  }

  const reviews = await Review.find(query)
    .populate("user", "name email profilePic")
    .populate("product", "name image price")
    .sort({ createdAt: -1 })
    .skip(skip)
    .limit(limit);

  const total = await Review.countDocuments(query);

  return {
    data: reviews,
    total,
    page: Number(page),
    totalPages: Math.ceil(total / limit),
  };
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

  // Update Product stats (only approved)
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
  return { message: "Review deleted by admin" };
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

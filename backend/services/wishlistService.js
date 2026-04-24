const Wishlist = require("../models/Wishlist");
const Product = require("../models/Product");

exports.toggleWishlist = async (userId, productId) => {
  const existingItem = await Wishlist.findOne({ user: userId, product: productId });
  
  if (existingItem) {
    await Wishlist.findByIdAndDelete(existingItem._id);
    return { status: 'removed', productId };
  } else {
    const newItem = await Wishlist.create({ user: userId, product: productId });
    return { status: 'added', item: newItem };
  }
};

exports.addWishlistItem = async (userId, productId, notes = "") => {
  const existingItem = await Wishlist.findOne({ user: userId, product: productId });
  if (existingItem) {
    throw new Error("Product is already in the wishlist.");
  }
  const newItem = await Wishlist.create({ user: userId, product: productId, notes });
  return await newItem.populate({ path: "product", populate: { path: "category", select: "name" } });
};

exports.getWishlist = async (userId) => {
  // Mobile app expects populated products to display in the list directly or embedded.
  // We'll return the wishlist documents.
  return await Wishlist.find({ user: userId }).populate({
    path: "product",
    populate: { path: "category", select: "name" }
  });
};

exports.updateWishlistItem = async (id, userId, updates) => {
  const item = await Wishlist.findOneAndUpdate(
    { _id: id, user: userId },
    { $set: updates },
    { new: true }
  ).populate({ path: "product", populate: { path: "category", select: "name" } });
  
  if (!item) throw new Error("Wishlist item not found");
  return item;
};

exports.deleteWishlistItem = async (id, userId) => {
  const item = await Wishlist.findOneAndDelete({ _id: id, user: userId });
  if (!item) throw new Error("Wishlist item not found");
  return item;
};

// Admin Service
exports.getAdminUserWishlist = async (userId, page = 1, limit = 10, filter = "") => {
  const query = { user: userId };
  
  // If we want to filter by product name, we might have to lookup, 
  // but a simple way is to find products matching filter first, then query by those IDs,
  // or use aggregation. Let's do a simple product search first if filter exists.
  if (filter) {
    const matchingProducts = await Product.find({ name: { $regex: filter, $options: "i" } }).select('_id');
    const productIds = matchingProducts.map(p => p._id);
    query.product = { $in: productIds };
  }

  const skip = (page - 1) * limit;
  
  const items = await Wishlist.find(query)
    .populate({ path: "product", populate: { path: "category", select: "name" } })
    .skip(skip)
    .limit(limit)
    .sort({ createdAt: -1 });
    
  const total = await Wishlist.countDocuments(query);
  
  return {
    items,
    total,
    page: parseInt(page),
    totalPages: Math.ceil(total / limit)
  };
};

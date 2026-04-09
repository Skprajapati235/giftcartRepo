const User = require("../models/User");

exports.toggleWishlist = async (userId, productId) => {
  const user = await User.findById(userId);
  if (!user) throw new Error("User not found");

  const index = user.wishlist.indexOf(productId);
  if (index === -1) {
    user.wishlist.push(productId);
  } else {
    user.wishlist.splice(index, 1);
  }

  await user.save();
  return user.wishlist;
};

exports.getWishlist = async (userId) => {
  const user = await User.findById(userId).populate({
    path: "wishlist",
    populate: { path: "category", select: "name" }
  });
  if (!user) throw new Error("User not found");
  return user.wishlist;
};

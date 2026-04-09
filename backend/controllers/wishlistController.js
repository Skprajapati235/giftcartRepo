const service = require("../services/wishlistService");

exports.toggleWishlist = async (req, res) => {
  try {
    const wishlist = await service.toggleWishlist(req.user.id, req.body.productId);
    res.json(wishlist);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
};

exports.getWishlist = async (req, res) => {
  try {
    const wishlist = await service.getWishlist(req.user.id);
    res.json(wishlist);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
};

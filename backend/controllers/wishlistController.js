const service = require("../services/wishlistService");

exports.toggleWishlist = async (req, res) => {
  try {
    const result = await service.toggleWishlist(req.user.id, req.body.productId);
    res.json(result);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
};

exports.addWishlistItem = async (req, res) => {
  try {
    const result = await service.addWishlistItem(req.user.id, req.body.productId, req.body.notes);
    res.status(201).json(result);
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

exports.updateWishlistItem = async (req, res) => {
  try {
    const result = await service.updateWishlistItem(req.params.id, req.user.id, req.body);
    res.json(result);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
};

exports.deleteWishlistItem = async (req, res) => {
  try {
    await service.deleteWishlistItem(req.params.id, req.user.id);
    res.json({ message: "Wishlist item deleted successfully" });
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
};

exports.getAdminUserWishlist = async (req, res) => {
  try {
    const { page, limit, filter } = req.query;
    const result = await service.getAdminUserWishlist(req.params.userId, page, limit, filter);
    res.json(result);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
};

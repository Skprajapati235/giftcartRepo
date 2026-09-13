const service = require("../services/cartService");

// req.user is set by authMiddleware after verifying the JWT.
function getUserId(req) {
  return req.user?.id || req.user?._id;
}

exports.getCart = async (req, res) => {
  try {
    const data = await service.getCart(getUserId(req));
    res.json({ success: true, ...data });
  } catch (error) {
    res.status(error.statusCode || 500).json({ success: false, message: error.message });
  }
};

exports.addItem = async (req, res) => {
  try {
    const { productId, quantity, weight, flowerCount, flavor, isEggless } = req.body;
    if (!productId) {
      return res.status(400).json({ success: false, message: "productId is required" });
    }
    const data = await service.addItem(getUserId(req), {
      productId, quantity, weight, flowerCount, flavor, isEggless,
    });
    res.json({ success: true, ...data });
  } catch (error) {
    res.status(error.statusCode || 500).json({ success: false, message: error.message });
  }
};

exports.updateItem = async (req, res) => {
  try {
    const { itemId } = req.params;
    const { quantity } = req.body;
    const data = await service.updateItemQuantity(getUserId(req), itemId, quantity);
    res.json({ success: true, ...data });
  } catch (error) {
    res.status(error.statusCode || 500).json({ success: false, message: error.message });
  }
};

exports.removeItem = async (req, res) => {
  try {
    const { itemId } = req.params;
    const data = await service.removeItem(getUserId(req), itemId);
    res.json({ success: true, ...data });
  } catch (error) {
    res.status(error.statusCode || 500).json({ success: false, message: error.message });
  }
};

exports.clearCart = async (req, res) => {
  try {
    const data = await service.clearCart(getUserId(req));
    res.json({ success: true, ...data });
  } catch (error) {
    res.status(error.statusCode || 500).json({ success: false, message: error.message });
  }
};

// No auth required — used to price the guest (local-storage) cart so even
// logged-out users see totals computed by the backend, never the frontend.
exports.getGuestQuote = async (req, res) => {
  try {
    const { items } = req.body;
    const data = await service.getGuestQuote(Array.isArray(items) ? items : []);
    res.json({ success: true, ...data });
  } catch (error) {
    res.status(error.statusCode || 500).json({ success: false, message: error.message });
  }
};

exports.mergeCart = async (req, res) => {
  try {
    const { items } = req.body;
    const data = await service.mergeGuestCart(getUserId(req), Array.isArray(items) ? items : []);
    res.json({ success: true, ...data });
  } catch (error) {
    res.status(error.statusCode || 500).json({ success: false, message: error.message });
  }
};
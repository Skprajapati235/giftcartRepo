const express = require("express");
const router = express.Router();
const controller = require("../controllers/cartController");
const authMiddleware = require("../middleware/authMiddleware");

// Guests are allowed to browse and add to cart without logging in — this
// one route stays public so their locally-stored cart is still priced by
// the backend (never calculated on the frontend).
router.post("/quote", controller.getGuestQuote);

// Everything below needs a logged-in user — the persisted cart lives on
// the server per user. Login is only required when the guest is ready to
// checkout, at which point the local cart is sent to /api/cart/merge.
router.use(authMiddleware);

router.get("/", controller.getCart);
router.post("/add", controller.addItem);
router.post("/merge", controller.mergeCart);
router.put("/item/:itemId", controller.updateItem);
router.delete("/item/:itemId", controller.removeItem);
router.delete("/clear", controller.clearCart);

module.exports = router;
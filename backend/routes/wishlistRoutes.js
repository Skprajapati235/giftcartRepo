const express = require("express");
const router = express.Router();
const controller = require("../controllers/wishlistController");
const authMiddleware = require("../middleware/authMiddleware");

router.post("/toggle", authMiddleware, controller.toggleWishlist);
router.get("/", authMiddleware, controller.getWishlist);

module.exports = router;

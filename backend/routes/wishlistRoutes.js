const express = require("express");
const router = express.Router();
const controller = require("../controllers/wishlistController");
const authMiddleware = require("../middleware/authMiddleware");
const adminMiddleware = require("../middleware/adminMiddleware");

// User routes (Mobile/Web)
router.post("/toggle", authMiddleware, controller.toggleWishlist); // Toggle is used by mobile currently
router.post("/", authMiddleware, controller.addWishlistItem); // Create
router.get("/", authMiddleware, controller.getWishlist); // Read
router.put("/:id", authMiddleware, controller.updateWishlistItem); // Update
router.delete("/:id", authMiddleware, controller.deleteWishlistItem); // Delete

// Admin routes
router.get("/admin/user/:userId", authMiddleware, adminMiddleware, controller.getAdminUserWishlist);

module.exports = router;

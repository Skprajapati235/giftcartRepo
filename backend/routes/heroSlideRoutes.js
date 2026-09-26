const express = require("express");
const router = express.Router();
const controller = require("../controllers/heroSlideController");
const adminMiddleware = require("../middleware/adminMiddleware");

// Public access for mobile & web apps, supports admin query parameters as well
router.get("/", controller.getAll);

// Admin-only management endpoints
router.post("/", adminMiddleware, controller.create);
router.put("/:id", adminMiddleware, controller.update);
router.delete("/:id", adminMiddleware, controller.delete);

module.exports = router;

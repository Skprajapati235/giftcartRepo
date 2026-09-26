const express = require("express");
const router = express.Router();
const controller = require("../controllers/testimonialController");
const adminMiddleware = require("../middleware/adminMiddleware");

// Public endpoints
router.get("/", controller.getAll);
router.get("/:id", controller.getById);

// Admin-only management endpoints
router.post("/", adminMiddleware, controller.create);
router.post("/bulk-delete", adminMiddleware, controller.bulkDelete);
router.put("/reorder", adminMiddleware, controller.reorder);
router.put("/:id", adminMiddleware, controller.update);
router.patch("/:id/status", adminMiddleware, controller.updateStatus);
router.delete("/:id", adminMiddleware, controller.delete);

module.exports = router;

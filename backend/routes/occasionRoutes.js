const express = require("express");
const router = express.Router();
const controller = require("../controllers/occasionController");
const adminMiddleware = require("../middleware/adminMiddleware");

// Public — navbar list + category filter (supports ?all=true for the
// lightweight full list, or ?page/&limit/&search for the admin table).
router.get("/", controller.getAll);

// Admin — create/edit/delete occasions.
router.post("/", adminMiddleware, controller.create);
router.put("/:id", adminMiddleware, controller.update);
router.delete("/:id", adminMiddleware, controller.delete);

module.exports = router;

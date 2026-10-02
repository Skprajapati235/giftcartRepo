const express = require("express");
const router = express.Router();
const controller = require("../controllers/storyController");
const adminMiddleware = require("../middleware/adminMiddleware");

router.get("/", controller.getStories);
router.post("/", adminMiddleware, controller.createStory);
router.put("/:id", adminMiddleware, controller.updateStory);
router.delete("/:id", adminMiddleware, controller.deleteStory);

module.exports = router;

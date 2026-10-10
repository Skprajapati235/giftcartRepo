const express = require("express");
const router = express.Router();
const controller = require("../controllers/storyController");
const adminMiddleware = require("../middleware/adminMiddleware");

const storyManage = adminMiddleware.requireRole(
  ["super_admin", "admin", "seo_specialist"],
  ["/stories"]
);

router.get("/", controller.getStories);
router.post("/", adminMiddleware, storyManage, controller.createStory);
router.put("/:id", adminMiddleware, storyManage, controller.updateStory);
router.delete("/:id", adminMiddleware, storyManage, controller.deleteStory);

module.exports = router;

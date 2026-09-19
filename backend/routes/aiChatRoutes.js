const router = require("express").Router();
const controller = require("../controllers/aiChatController");

// Mounted at /api/ai-chat with adminMiddleware (see server.js)
router.get("/", controller.list);
router.get("/:chatId", controller.get);
router.patch("/:chatId", controller.rename);
router.delete("/:chatId", controller.remove);

module.exports = router;
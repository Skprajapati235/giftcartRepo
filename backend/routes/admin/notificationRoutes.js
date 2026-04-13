const router = require("express").Router();
const controller = require("../../controllers/notificationController");

router.get("/", controller.getNotifications);
router.put("/read/:id", controller.markAsRead);
router.put("/read-all", controller.markAllAsRead);

module.exports = router;

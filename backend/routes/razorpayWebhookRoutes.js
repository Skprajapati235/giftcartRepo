// PATH: backend/routes/razorpayWebhookRoutes.js
const router = require("express").Router();
const controller = require("../controllers/razorpayWebhookController");

router.post("/", controller.handle);

module.exports = router;

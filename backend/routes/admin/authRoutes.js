const router = require("express").Router();
const controller = require("../../controllers/adminAuthController");
const adminMiddleware = require("../../middleware/adminMiddleware");

router.post("/register", controller.register);
router.post("/login", controller.login);
router.post("/forgot-password", controller.forgotPassword);
router.post("/reset-password", controller.resetPassword);
router.post("/google-login", controller.googleLogin);
router.get("/verify-session", adminMiddleware, controller.verifySession);

module.exports = router;

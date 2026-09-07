const router = require("express").Router();
const controller = require("../../controllers/adminAuthController");

router.post("/register", controller.register);
router.post("/login", controller.login);
router.post("/forgot-password", controller.forgotPassword);
router.post("/reset-password", controller.resetPassword);
router.post("/google-login", controller.googleLogin);

module.exports = router;

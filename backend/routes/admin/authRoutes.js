const router = require("express").Router();
const controller = require("../../controllers/adminAuthController");

router.post("/register", controller.register);
router.post("/login", controller.login);
router.post("/google-login", controller.googleLogin);

module.exports = router;

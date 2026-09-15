const router = require("express").Router();
const controller = require("../controllers/authController");
const authMiddleware = require("../middleware/authMiddleware");

// Mobile OTP is the only sign-in path for customers now (website + app).
router.post("/send-otp", controller.sendOtp);
router.post("/verify-otp", controller.verifyOtp);
router.put("/profile", authMiddleware, controller.updateProfile);

module.exports = router;
const authService = require("../services/authService");
const generateToken = require("../utils/generateToken");

// Customers (website + mobile app) sign in with mobile OTP only — see
// requestLoginOtp / verifyLoginOtp in services/authService.js. Email +
// password login was removed for users; Admin login is untouched and
// lives in adminAuthController.js / routes/admin/authRoutes.js.

exports.sendOtp = async (req, res) => {
  try {
    const { name, mobileNumber } = req.body;
    const result = await authService.requestLoginOtp({ name, mobileNumber });
    res.json({ success: true, message: "OTP sent successfully", ...result });
  } catch (err) {
    res.status(400).json({ success: false, message: err.message });
  }
};

exports.verifyOtp = async (req, res) => {
  try {
    const { mobileNumber, otp } = req.body;
    const user = await authService.verifyLoginOtp({ mobileNumber, otp });
    res.json({
      success: true,
      user,
      token: generateToken(user._id, user.role),
    });
  } catch (err) {
    res.status(400).json({ success: false, message: err.message });
  }
};

exports.updateProfile = async (req, res) => {
  try {
    const userId = req.user.id;
    const user = await authService.updateUserProfile(userId, req.body);
    res.json(user);
  } catch (err) {
    res.status(400).json({ message: err.message });
  }
};

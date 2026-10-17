// const authService = require("../services/authService");
// const generateToken = require("../utils/generateToken");

// // Customers (website + mobile app) sign in with mobile OTP only — see
// // requestLoginOtp / verifyLoginOtp in services/authService.js. Email +
// // password login was removed for users; Admin login is untouched and
// // lives in adminAuthController.js / routes/admin/authRoutes.js.

// exports.sendOtp = async (req, res) => {
//   try {
//     const { name, mobileNumber } = req.body;
//     const result = await authService.requestLoginOtp({ name, mobileNumber });
//     res.json({ success: true, message: "OTP sent successfully to your mobile", ...result });
//   } catch (err) {
//     res.status(400).json({ success: false, message: err.message });
//   }
// };

// exports.verifyOtp = async (req, res) => {
//   try {
//     const { mobileNumber, otp } = req.body;
//     const user = await authService.verifyLoginOtp({ mobileNumber, otp });
//     res.json({
//       success: true,
//       user,
//       token: generateToken(user._id, user.role),
//     });
//   } catch (err) {
//     res.status(400).json({ success: false, message: err.message });
//   }
// };

// exports.updateProfile = async (req, res) => {
//   try {
//     const userId = req.user.id;
//     const user = await authService.updateUserProfile(userId, req.body);
//     res.json(user);
//   } catch (err) {
//     res.status(400).json({ message: err.message });
//   }
// };


const authService = require("../services/authService");
const generateToken = require("../utils/generateToken");
const { sendWithSession, setAuthCookie, clearAuthCookie } = require("../utils/authCookie");

// Customers (website + mobile app) sign in with mobile OTP only — see
// requestLoginOtp / verifyLoginOtp in services/authService.js. Email +
// password login was removed for users; Admin login is untouched and
// lives in adminAuthController.js / routes/admin/authRoutes.js.

exports.sendOtp = async (req, res) => {
  try {
    const { name, mobileNumber } = req.body;
    const result = await authService.requestLoginOtp({ name, mobileNumber });
    res.json({ success: true, message: "OTP sent successfully to your mobile", ...result });
  } catch (err) {
    res.status(400).json({ success: false, message: err.message });
  }
};

exports.verifyOtp = async (req, res) => {
  try {
    const { mobileNumber, otp } = req.body;
    const user = await authService.verifyLoginOtp({ mobileNumber, otp });
    // mobile → { token } in the body (unchanged); website → httpOnly cookie, no token in body
    return sendWithSession(req, res, { success: true, user }, generateToken(user._id, user.role));
  } catch (err) {
    res.status(400).json({ success: false, message: err.message });
  }
};

// POST /api/auth/session  (Authorization: Bearer <old token>)
// One-time upgrade for customers who are already logged in with a localStorage token:
// exchanges it for a httpOnly cookie so nobody has to log in again.
exports.exchangeSession = async (req, res) => {
  const token = generateToken(req.user.id, req.user.role);
  setAuthCookie(res, token);
  res.json({ success: true });
};

// POST /api/auth/logout — clears the session cookie
exports.logout = async (req, res) => {
  clearAuthCookie(res);
  res.json({ success: true });
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

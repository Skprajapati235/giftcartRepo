const authService = require("../services/authService");
const generateToken = require("../utils/generateToken");

exports.register = async (req, res) => {
  try {
    const user = await authService.registerUser({ ...req.body, role: "user" });
    res.json({ user, token: generateToken(user._id, user.role) });
  } catch (err) {
    res.status(400).json({ message: err.message });
  }
};

exports.login = async (req, res) => {
  try {
    const { email, password } = req.body;
    const user = await authService.loginUser({ email, password });
    res.json({ user, token: generateToken(user._id, user.role) });
  } catch (err) {
    res.status(400).json({ message: err.message });
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

exports.forgotPassword = async (req, res) => {
  try {
    await authService.requestPasswordReset({ ...req.body, accountType: "user" });
    res.json({ message: "If an account exists for this email, an OTP has been sent" });
  } catch (err) {
    res.status(400).json({ message: err.message });
  }
};

exports.resetPassword = async (req, res) => {
  try {
    await authService.resetPassword({ ...req.body, accountType: "user" });
    res.json({ message: "Password reset successfully. You can now log in" });
  } catch (err) {
    res.status(400).json({ message: err.message });
  }
};
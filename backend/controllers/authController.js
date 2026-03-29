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
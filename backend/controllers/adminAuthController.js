const authService = require("../services/authService");
const generateToken = require("../utils/generateToken");

exports.register = async (req, res) => {
  try {
    const admin = await authService.registerAdmin(req.body);
    res.status(201).json({ admin });
  } catch (err) {
    res.status(400).json({ message: err.message });
  }
};

exports.login = async (req, res) => {
  try {
    const { email, password } = req.body;
    const admin = await authService.loginAdmin({ email, password });
    res.json({ admin, token: generateToken(admin._id, admin.role) });
  } catch (err) {
    res.status(400).json({ message: err.message });
  }
};


exports.googleLogin = async (req, res) => {
  try {
    const { email, name } = req.body;

    const admin = await authService.googleLogin({ email, name });

    res.json({
      admin,
      token: generateToken(admin._id, admin.role),
    });
  } catch (err) {
    res.status(400).json({ message: err.message });
  }
};
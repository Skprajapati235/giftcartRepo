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


const { OAuth2Client } = require("google-auth-library");
const client = new OAuth2Client("77642027655-ika7ain9hl6ah04g5ocv4qdccoc75a7q.apps.googleusercontent.com");

exports.googleLogin = async (req, res) => {
  try {
    const { idToken } = req.body;

    const ticket = await client.verifyIdToken({
      idToken: idToken,
      audience: "77642027655-ika7ain9hl6ah04g5ocv4qdccoc75a7q.apps.googleusercontent.com",
    });

    const payload = ticket.getPayload();
    const { email, name } = payload;

    const admin = await authService.googleLogin({ email, name });

    res.json({
      admin,
      token: generateToken(admin._id, admin.role),
    });
  } catch (err) {
    res.status(400).json({ message: "Invalid Google Token or Server Error" });
  }
};
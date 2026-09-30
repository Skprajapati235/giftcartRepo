const authService = require("../services/authService");
const generateToken = require("../utils/generateToken");
const Admin = require("../models/Admin");
const User = require("../models/User");

const sanitizeAdmin = (admin) => {
  if (!admin) return null;
  const obj = typeof admin.toObject === "function" ? admin.toObject() : { ...admin };
  delete obj.password;
  delete obj.resetOtpHash;
  delete obj.resetOtpExpiresAt;
  return obj;
};

exports.register = async (req, res) => {
  try {
    const admin = await authService.registerAdmin(req.body);
    res.status(201).json({ admin: sanitizeAdmin(admin) });
  } catch (err) {
    res.status(400).json({ message: err.message });
  }
};

exports.login = async (req, res) => {
  try {
    const { email, password } = req.body;
    const admin = await authService.loginAdmin({ email, password });
    res.json({ admin: sanitizeAdmin(admin), token: generateToken(admin._id, admin.role) });
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
      admin: sanitizeAdmin(admin),
      token: generateToken(admin._id, admin.role),
    });
  } catch (err) {
    res.status(400).json({ message: "Invalid Google Token or Server Error" });
  }
};

exports.forgotPassword = async (req, res) => {
  try {
    await authService.requestPasswordReset({ ...req.body, accountType: "admin" });
    res.json({ message: "If an account exists for this email, an OTP has been sent" });
  } catch (err) {
    res.status(400).json({ message: err.message });
  }
};

exports.resetPassword = async (req, res) => {
  try {
    await authService.resetPassword({ ...req.body, accountType: "admin" });
    res.json({ message: "Password reset successfully. You can now log in" });
  } catch (err) {
    res.status(400).json({ message: err.message });
  }
};

exports.verifySession = async (req, res) => {
  try {
    const adminId = req.user?.id;
    if (!adminId) {
      return res.status(401).json({ success: false, message: "Unauthorized: No active admin session" });
    }

    let admin = await Admin.findById(adminId).select("-password -resetOtpHash -resetOtpExpiresAt");
    if (!admin) {
      admin = await User.findById(adminId).select("-password -resetOtpHash -resetOtpExpiresAt");
    }

    if (!admin) {
      return res.status(401).json({ success: false, message: "Admin account not found" });
    }

    if (admin.role !== "admin") {
      return res.status(403).json({ success: false, message: "Admin privileges required" });
    }

    res.json({
      success: true,
      valid: true,
      admin: {
        id: admin._id,
        _id: admin._id,
        name: admin.name,
        email: admin.email,
        role: admin.role,
        profilePic: admin.profilePic,
        city: admin.city,
        state: admin.state,
      },
    });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message || "Failed to verify session" });
  }
};
const User = require("../models/User");
const Admin = require("../models/Admin");
const bcrypt = require("bcryptjs");
const whatsappService = require("../utils/whatsappService");
const emailService = require("../utils/emailService");
const { validateEmail, validatePassword } = require("../utils/authValidation");
const { createOtp, hashOtp } = require("../utils/passwordReset");

function isTruthyEnv(value) {
  return String(value || "").toLowerCase() === "true";
}

exports.registerUser = async (data) => {
  const { name, password } = data;
  const email = validateEmail(data.email);
  validatePassword(password);

  if (!String(name || "").trim()) throw new Error("Name is required");

  const userExists = await User.findOne({ email });
  if (userExists) throw new Error("User already exists");

  const hashed = await bcrypt.hash(password, 10);

  return await User.create({ name, email, password: hashed });
};

exports.loginUser = async (data) => {
  const { password } = data;
  const email = validateEmail(data.email);
  if (!password) throw new Error("Email and password are required");

  const user = await User.findOne({ email: { $regex: `^${escapeRegex(email)}$`, $options: "i" } });
  if (!user) throw new Error("User not found");

  const isMatch = await bcrypt.compare(password, user.password);
  if (!isMatch) throw new Error("Invalid credentials");

  if (isTruthyEnv(process.env.WHATSAPP_SEND_ON_LOGIN)) {
    try {
      await whatsappService.sendWhatsAppMessage({
        to: user?.mobileNumber,
        body: whatsappService.formatLoginMessage({ user }),
      });
    } catch (err) {
      console.warn("[whatsapp] login send failed:", err?.message || err);
    }
  }

  return user;
};

exports.googleLogin = async (data) => {
  const { email, name } = data;

  let admin = await Admin.findOne({ email });

  if (!admin) {
    admin = await Admin.create({
      name,
      email,
      password: "google-login",
      role: "admin",
    });
  }

  return admin;
};

// export default authService;

exports.updateUserProfile = async (userId, data) => {
  const { name, mobileNumber, profilePic, state, city } = data;
  
  const updateData = {};
  if (name !== undefined) updateData.name = name;
  if (mobileNumber !== undefined) updateData.mobileNumber = mobileNumber;
  if (profilePic !== undefined) updateData.profilePic = profilePic;
  if (state !== undefined) updateData.state = state;
  if (city !== undefined) updateData.city = city;

  const user = await User.findByIdAndUpdate(userId, updateData, { new: true });
  if (!user) throw new Error("User not found");

  return user;
};

exports.registerAdmin = async (data) => {
  const { name, password } = data;
  const email = validateEmail(data.email);
  validatePassword(password);

  if (!String(name || "").trim()) throw new Error("Name is required");

  const adminExists = await Admin.findOne({ email });
  if (adminExists) throw new Error("Admin already exists");

  const hashed = await bcrypt.hash(password, 10);

  return await Admin.create({ name, email, password: hashed, role: "admin" });
};

exports.loginAdmin = async (data) => {
  const { password } = data;
  const email = validateEmail(data.email);
  if (!password) throw new Error("Email and password are required");

  const admin = await Admin.findOne({ email: { $regex: `^${escapeRegex(email)}$`, $options: "i" } });
  if (!admin) throw new Error("Admin not found");

  const isMatch = await bcrypt.compare(password, admin.password);
  if (!isMatch) throw new Error("Invalid credentials");

  return admin;
};

function escapeRegex(value) {
  return value.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
}

async function findAccountByEmail(Model, email) {
  return Model.findOne({ email: { $regex: `^${escapeRegex(email)}$`, $options: "i" } }).select("+resetOtpHash +resetOtpExpiresAt");
}

exports.requestPasswordReset = async ({ email, accountType }) => {
  const normalizedEmail = validateEmail(email);
  const Model = accountType === "admin" ? Admin : User;
  const account = await findAccountByEmail(Model, normalizedEmail);

  if (!account) return;

  const otp = createOtp();
  account.resetOtpHash = hashOtp(otp);
  account.resetOtpExpiresAt = new Date(Date.now() + 10 * 60 * 1000);
  await account.save();
  await emailService.sendPasswordResetOtp({ email: account.email, name: account.name, otp });
};

exports.resetPassword = async ({ email, otp, newPassword, accountType }) => {
  const normalizedEmail = validateEmail(email);
  validatePassword(newPassword);
  if (!/^\d{6}$/.test(String(otp || ""))) throw new Error("Please enter the 6-digit OTP");

  const Model = accountType === "admin" ? Admin : User;
  const account = await findAccountByEmail(Model, normalizedEmail);
  if (!account || !account.resetOtpHash || !account.resetOtpExpiresAt || account.resetOtpExpiresAt < new Date()) {
    throw new Error("OTP is invalid or expired");
  }
  if (account.resetOtpHash !== hashOtp(otp)) throw new Error("OTP is invalid or expired");

  account.password = await bcrypt.hash(newPassword, 10);
  account.resetOtpHash = undefined;
  account.resetOtpExpiresAt = undefined;
  await account.save();
};
const User = require("../models/User");
const Admin = require("../models/Admin");
const OtpVerification = require("../models/OtpVerification");
const bcrypt = require("bcryptjs");
const whatsappService = require("../utils/whatsappService");
const emailService = require("../utils/emailService");
const otpService = require("../utils/otpService");
const { validateEmail, validatePassword, validateMobileNumber } = require("../utils/authValidation");
const { createOtp, hashOtp } = require("../utils/passwordReset");

const OTP_RESEND_COOLDOWN_MS = 30 * 1000; // avoid burning 2Factor credits on rapid re-taps
const OTP_SESSION_TTL_MS = 10 * 60 * 1000;
const MAX_OTP_ATTEMPTS = 5;

function isTruthyEnv(value) {
  return String(value || "").toLowerCase() === "true";
}

// registerUser / loginUser (email+password) removed — customers only
// sign in via mobile OTP now (requestLoginOtp / verifyLoginOtp below).
// Admin login stays separate and untouched — see registerAdmin/loginAdmin.

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

  try {
    const user = await User.findByIdAndUpdate(userId, updateData, { new: true, runValidators: true });
    if (!user) throw new Error("User not found");
    return user;
  } catch (err) {
    if (err.code === 11000) {
      const field = Object.keys(err.keyPattern || { mobileNumber: 1 })[0];
      throw new Error(`This ${field === "mobileNumber" ? "mobile number" : field} is already in use`);
    }
    throw err;
  }
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

// ─────────────────────────────────────────────────────────────
// Mobile OTP login / signup (customer-facing website)
// ─────────────────────────────────────────────────────────────

exports.requestLoginOtp = async ({ name, mobileNumber }) => {
  const mobile = validateMobileNumber(mobileNumber);
  const trimmedName = String(name || "").trim();

  const user = await User.findOne({ mobileNumber: mobile });
  
  if (user) {
    return { isOldUser: true, user };
  }

  if (!trimmedName) {
    throw new Error("Name is required for new users");
  }

  const existing = await OtpVerification.findOne({ mobileNumber: mobile });
  if (existing && Date.now() - new Date(existing.lastSentAt).getTime() < OTP_RESEND_COOLDOWN_MS) {
    const waitSeconds = Math.ceil(
      (OTP_RESEND_COOLDOWN_MS - (Date.now() - new Date(existing.lastSentAt).getTime())) / 1000
    );
    throw new Error(`Please wait ${waitSeconds}s before requesting another OTP`);
  }

  const { sessionId } = await otpService.sendOtp(mobile);

  await OtpVerification.findOneAndUpdate(
    { mobileNumber: mobile },
    {
      mobileNumber: mobile,
      name: trimmedName || (user ? user.name : ""),
      sessionId,
      attempts: 0,
      lastSentAt: new Date(),
      expiresAt: new Date(Date.now() + OTP_SESSION_TTL_MS),
    },
    { upsert: true, new: true }
  );

  return { mobileNumber: mobile };
};

exports.verifyLoginOtp = async ({ mobileNumber, otp }) => {
  const mobile = validateMobileNumber(mobileNumber);
  const code = String(otp || "").trim();
  if (!/^\d{4,6}$/.test(code)) throw new Error("Please enter a valid OTP");

  const record = await OtpVerification.findOne({ mobileNumber: mobile });
  if (!record || record.expiresAt < new Date()) {
    throw new Error("OTP has expired. Please request a new one");
  }

  if (record.attempts >= MAX_OTP_ATTEMPTS) {
    await record.deleteOne();
    throw new Error("Too many incorrect attempts. Please request a new OTP");
  }

  const isValid = await otpService.verifyOtp(record.sessionId, code);
  if (!isValid) {
    record.attempts += 1;
    await record.save();
    throw new Error("Incorrect OTP. Please try again");
  }

  let user = await User.findOne({ mobileNumber: mobile });
  if (!user) {
    user = await User.create({
      name: record.name,
      mobileNumber: mobile,
      role: "user",
    });
  }

  await record.deleteOne();

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
  await emailService.sendPasswordResetOtp({ email: account.email, name: account.name, otp });
  account.resetOtpHash = hashOtp(otp);
  account.resetOtpExpiresAt = new Date(Date.now() + 10 * 60 * 1000);
  await account.save();
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
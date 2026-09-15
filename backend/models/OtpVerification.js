const mongoose = require("mongoose");

// Short-lived record used only to get a user through the mobile OTP
// login/signup flow. It never becomes the source of truth for a user's
// data — once OTP is verified we read/write the real User document and
// this record is deleted.
const otpVerificationSchema = new mongoose.Schema(
  {
    mobileNumber: { type: String, required: true, unique: true, index: true },
    // Name the person typed on the auth screen. Only used if we end up
    // creating a brand-new User once the OTP is verified.
    name: { type: String },
    // Session id returned by 2Factor's AUTOGEN endpoint. Verification is
    // delegated to 2Factor itself (see utils/otpService.js) — we never
    // generate or store the OTP value ourselves.
    sessionId: { type: String, required: true },
    attempts: { type: Number, default: 0 },
    lastSentAt: { type: Date, default: Date.now },
    expiresAt: { type: Date, required: true },
  },
  { timestamps: true }
);

// TTL index — Mongo automatically drops the record once it's expired, so
// stale OTP sessions never pile up.
otpVerificationSchema.index({ expiresAt: 1 }, { expireAfterSeconds: 0 });

module.exports = mongoose.model("OtpVerification", otpVerificationSchema);

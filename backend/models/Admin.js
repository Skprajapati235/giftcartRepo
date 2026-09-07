const mongoose = require("mongoose");

const adminSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: true,
    },
    email: {
      type: String,
      required: true,
      unique: true,
    },
    password: {
      type: String,
      required: true,
    },
    resetOtpHash: { type: String, select: false },
    resetOtpExpiresAt: { type: Date, select: false },
    city: {
      type: String,
    },
    profilePic: {
      type: String,
    },
    role: {
      type: String,
      enum: ["admin"],
      default: "admin",
    },
  },
  { timestamps: true }
);

module.exports = mongoose.model("Admin", adminSchema);

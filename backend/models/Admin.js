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
      enum: [
        "super_admin",
        "admin",
        "kitchen_manager",
        "delivery_coordinator",
        "support_agent",
        "seo_specialist",
      ],
      default: "super_admin",
    },
    department: {
      type: String,
      default: "Executive Management",
    },
    permissions: {
      type: [String],
      default: ["*"],
    },
  },
  { timestamps: true }
);

module.exports = mongoose.model("Admin", adminSchema);

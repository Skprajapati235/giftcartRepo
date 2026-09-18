const mongoose = require("mongoose");

const crmContactSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: true,
      trim: true,
    },
    email: {
      type: String,
      trim: true,
      lowercase: true,
    },
    phone: {
      type: String,
      required: true,
    },
    company: {
      type: String,
      trim: true,
    },
    role: {
      type: String,
      trim: true,
    },
    source: {
      type: String,
      enum: [
        "Instagram",
        "Facebook",
        "Website",
        "WhatsApp",
        "Phone call",
        "Google",
        "Referral",
        "Advertisement",
        "Offline enquiry",
      ],
      default: "Website",
    },
    type: {
      type: String,
      enum: ["Customer", "Partner", "Supplier"],
      default: "Customer",
    },
    status: {
      type: String,
      enum: ["Active", "Inactive"],
      default: "Active",
    },
    lastContactDate: {
      type: Date,
      default: Date.now,
    },
    notes: {
      type: String,
      trim: true,
    },
  },
  {
    timestamps: true,
  }
);

module.exports = mongoose.model("CrmContact", crmContactSchema);

const mongoose = require("mongoose");

const seoRedirectSchema = new mongoose.Schema(
  {
    fromPath: {
      type: String,
      required: true,
      unique: true,
      trim: true,
      lowercase: true,
    },
    toPath: {
      type: String,
      required: true,
      trim: true,
    },
    statusCode: {
      type: Number,
      enum: [301, 302],
      default: 301,
    },
    isActive: {
      type: Boolean,
      default: true,
    },
    hits: {
      type: Number,
      default: 0,
    },
    description: {
      type: String,
      default: "",
    },
  },
  { timestamps: true }
);

module.exports = mongoose.model("SeoRedirect", seoRedirectSchema);

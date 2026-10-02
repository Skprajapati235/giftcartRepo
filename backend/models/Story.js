const mongoose = require("mongoose");

const storySchema = new mongoose.Schema(
  {
    title: {
      type: String,
      required: true,
      trim: true,
    },
    thumbnail: {
      type: String,
      required: true,
    },
    subtitle: {
      type: String,
      default: "",
    },
    mediaUrl: {
      type: String,
      required: true,
    },
    mediaType: {
      type: String,
      enum: ["image", "video"],
      default: "image",
    },
    duration: {
      type: Number,
      default: 5,
      min: 3,
      max: 30,
    },
    tag: {
      type: String,
      default: "TRENDING", // e.g. "MIDNIGHT", "NEW", "OFFER", "EXCLUSIVE"
    },
    ctaText: {
      type: String,
      default: "Shop This Look",
    },
    ctaLink: {
      type: String,
      default: "/category/cakes",
    },
    ctaCategory: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Category",
    },
    isActive: {
      type: Boolean,
      default: true,
    },
    sortOrder: {
      type: Number,
      default: 0,
    },
  },
  { timestamps: true }
);

module.exports = mongoose.model("Story", storySchema);

const mongoose = require("mongoose");

const gallerySettingSchema = new mongoose.Schema(
  {
    key: {
      type: String,
      default: "default_gallery_settings",
      unique: true,
    },
    mobileLayout: {
      type: String,
      enum: ["masonry", "grid", "feed", "carousel"],
      default: "masonry",
    },
    webLayout: {
      type: String,
      enum: ["masonry", "grid", "carousel", "slideshow"],
      default: "masonry",
    },
    title: {
      type: String,
      default: "Moments of Joy 📸",
      trim: true,
    },
    subtitle: {
      type: String,
      default: "Real customer celebrations & deliveries",
      trim: true,
    },
    enableLikes: {
      type: Boolean,
      default: true,
    },
    enableShopLook: {
      type: Boolean,
      default: true,
    },
    itemsPerPage: {
      type: Number,
      default: 12,
    },
    updatedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Admin",
      default: null,
    },
  },
  { timestamps: true }
);

module.exports = mongoose.model("GallerySetting", gallerySettingSchema);

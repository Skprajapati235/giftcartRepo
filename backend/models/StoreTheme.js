const mongoose = require("mongoose");

const storeThemeSchema = new mongoose.Schema(
  {
    key: {
      type: String,
      default: "storefront_theme",
      unique: true,
    },
    presetId: {
      type: String,
      default: "festive-pink",
    },
    presetName: {
      type: String,
      default: "Festive Pink (Default)",
    },
    primaryColor: {
      type: String,
      default: "#D82B76",
    },
    secondaryColor: {
      type: String,
      default: "#FF6A3D",
    },
    brandBerry: {
      type: String,
      default: "#741343",
    },
    brandGold: {
      type: String,
      default: "#ffd166",
    },
    brandCream: {
      type: String,
      default: "#fffaf3",
    },
    backgroundColor: {
      type: String,
      default: "#ffffff",
    },
    textColor: {
      type: String,
      default: "#1a1a1a",
    },
    fontFamily: {
      type: String,
      default: "Inter",
    },
    borderRadius: {
      type: String,
      default: "16px",
    },
    announcementBar: {
      enabled: {
        type: Boolean,
        default: true,
      },
      text: {
        type: String,
        default: "🎉 Flat 15% OFF on Midnight Cake Deliveries! Use Code FESTIVE15",
      },
      bgColor: {
        type: String,
        default: "#741343",
      },
      textColor: {
        type: String,
        default: "#ffffff",
      },
      link: {
        type: String,
        default: "/categories",
      },
    },
    storeTagline: {
      type: String,
      default: "Faridabad's Most Trusted Online Cake & Gift Destination",
    },
    badgeText: {
      type: String,
      default: "✨ 100% Fresh & Eggless Available",
    },
    updatedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Admin",
    },
  },
  { timestamps: true }
);

module.exports = mongoose.model("StoreTheme", storeThemeSchema);

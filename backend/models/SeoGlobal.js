const mongoose = require("mongoose");

const seoGlobalSchema = new mongoose.Schema(
  {
    // Basic Meta Defaults
    siteName: { type: String, default: "GiftFestive" },
    defaultTitle: {
      type: String,
      default: "GiftFestive | Faridabad Most Trusted Online Gift, Cake & Flower Delivery",
    },
    titleTemplate: { type: String, default: "%s | GiftFestive" },
    defaultDescription: {
      type: String,
      default:
        "Faridabad most trusted online gifting platform. Order fresh flowers, artisan cakes, customized gift hampers & surprises with express same-day and midnight delivery.",
    },
    defaultKeywords: [
      {
        type: String,
      },
    ],
    siteUrl: { type: String, default: "https://giftfestive.com" },

    // Social & OpenGraph
    defaultOgImage: {
      type: String,
      default: "https://giftfestive.com/opengraph-image",
    },
    twitterHandle: { type: String, default: "@giftfestive" },
    twitterCardType: { type: String, default: "summary_large_image" },

    // Webmaster & Analytics
    googleSiteVerification: { type: String, default: "" },
    bingSiteVerification: { type: String, default: "" },
    pinterestVerification: { type: String, default: "" },
    googleAnalyticsId: { type: String, default: "" }, // e.g. G-XXXXXXXXXX
    googleTagManagerId: { type: String, default: "" }, // e.g. GTM-XXXXXXX
    facebookPixelId: { type: String, default: "" },

    // Robots.txt custom config
    robotsCustomRules: { type: String, default: "" },

    // Schema.org Organization Details
    organization: {
      legalName: { type: String, default: "GiftFestive Private Limited" },
      founder: { type: String, default: "Sonu Prajapati" },
      telephone: { type: String, default: "+91-9999999999" },
      email: { type: String, default: "support@giftfestive.com" },
      logoUrl: { type: String, default: "https://giftfestive.com/icon-512.png" },
      priceRange: { type: String, default: "₹₹" },
      currenciesAccepted: { type: String, default: "INR" },
      streetAddress: { type: String, default: "Sector 15" },
      addressLocality: { type: String, default: "Faridabad" },
      addressRegion: { type: String, default: "Haryana" },
      postalCode: { type: String, default: "121001" },
      addressCountry: { type: String, default: "IN" },
      geoLatitude: { type: Number, default: 28.4089 },
      geoLongitude: { type: Number, default: 77.3178 },
      openingHours: { type: String, default: "Mo-Su 08:00-23:00" },
      socialLinks: [
        {
          type: String,
        },
      ],
    },
  },
  { timestamps: true }
);

module.exports = mongoose.model("SeoGlobal", seoGlobalSchema);

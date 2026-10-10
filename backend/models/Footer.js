const mongoose = require("mongoose");

const socialLinkSchema = new mongoose.Schema(
  {
    platform: { type: String, required: true }, // e.g. "instagram", "facebook", "youtube", "twitter", "whatsapp"
    url: { type: String, required: true },
    icon: { type: String, default: "" },
    isActive: { type: Boolean, default: true },
  },
  { _id: true }
);

const trustBadgeSchema = new mongoose.Schema(
  {
    title: { type: String, required: true },
    subtitle: { type: String, default: "" },
    icon: { type: String, default: "award" }, // "award", "heart", "truck", "shield", "star", "gift", "clock"
    color: { type: String, default: "#ffd166" },
    sortOrder: { type: Number, default: 0 },
    isActive: { type: Boolean, default: true },
  },
  { _id: true, timestamps: true }
);

const footerLinkSchema = new mongoose.Schema(
  {
    label: { type: String, required: true },
    url: { type: String, required: true },
    badge: { type: String, default: "" }, // e.g. "New", "4.9 ★", "Hot"
    badgeColor: { type: String, default: "" },
    isExternal: { type: Boolean, default: false },
    sortOrder: { type: Number, default: 0 },
    isActive: { type: Boolean, default: true },
  },
  { _id: true, timestamps: true }
);

const footerColumnSchema = new mongoose.Schema(
  {
    title: { type: String, required: true }, // e.g. "Explore", "Company & Trust"
    sortOrder: { type: Number, default: 0 },
    isActive: { type: Boolean, default: true },
    links: [footerLinkSchema],
  },
  { _id: true, timestamps: true }
);

const footerSchema = new mongoose.Schema(
  {
    key: {
      type: String,
      default: "main_footer",
      unique: true,
      index: true,
    },
    brand: {
      brandName: { type: String, default: "GiftFestive" },
      logoUrl: { type: String, default: "/images/websitelogoimages.png" },
      tagline: {
        type: String,
        default:
          "Making celebrations unforgettable with artisanal cakes, farm-fresh flowers, and personalized gifts curated with pure warmth and care.",
      },
      phone: { type: String, default: "+91 84007 87712" },
      phoneLabel: { type: String, default: "+91 84007 87712 (WhatsApp / Call)" },
      whatsappUrl: { type: String, default: "https://wa.me/918400787712" },
      email: { type: String, default: "support@giftfestive.in" },
      address: { type: String, default: "Sector 15, Faridabad, Haryana – 121001" },
      mapUrl: { type: String, default: "https://maps.google.com/?q=Faridabad" },
      socialLinks: [socialLinkSchema],
    },
    trustBadges: [trustBadgeSchema],
    columns: [footerColumnSchema],
    newsletter: {
      title: { type: String, default: "The Festive Club" },
      description: {
        type: String,
        default: "Subscribe for secret promo codes, new arrivals & festive discounts.",
      },
      placeholder: { type: String, default: "Enter your email..." },
      buttonText: { type: String, default: "Subscribe" },
      disclaimer: { type: String, default: "No spam. Unsubscribe anytime." },
      isEnabled: { type: Boolean, default: true },
    },
    bottomStrip: {
      copyrightText: {
        type: String,
        default: "© {year} GiftFestive. All rights reserved. Founded with love for celebrations.",
      },
      paymentMethods: {
        type: [String],
        default: ["UPI", "Cards", "NetBanking", "Cash on Delivery"],
      },
      taglineBadge: {
        type: String,
        default: "100% Safe & Secure • Made with ❤️",
      },
    },
    seo: {
      organizationName: { type: String, default: "GiftFestive" },
      founderName: { type: String, default: "Sonu Prajapati" },
      telephone: { type: String, default: "+91 98765 43210" },
      email: { type: String, default: "support@giftfestive.in" },
      addressLocality: { type: String, default: "Faridabad" },
      addressRegion: { type: String, default: "Haryana" },
      postalCode: { type: String, default: "121001" },
      addressCountry: { type: String, default: "IN" },
      googleReviewsRating: { type: String, default: "4.9" },
      googleReviewsCount: { type: String, default: "500+" },
      googleReviewsUrl: {
        type: String,
        default: "https://www.google.com/search?q=GiftFestive+Faridabad+Reviews",
      },
      richSnippetsEnabled: { type: Boolean, default: true },
      customSchemaJson: { type: String, default: "" },
      seoKeywords: {
        type: [String],
        default: [
          "Online cake delivery Faridabad",
          "Surprise gift service",
          "Flower bouquet Faridabad",
          "Midnight cake delivery",
        ],
      },
    },
    lastUpdatedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Admin",
    },
  },
  { timestamps: true }
);

module.exports = mongoose.model("Footer", footerSchema);

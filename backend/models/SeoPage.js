const mongoose = require("mongoose");

const seoPageSchema = new mongoose.Schema(
  {
    path: {
      type: String,
      required: true,
      unique: true,
      trim: true,
      lowercase: true, // e.g. "/", "/about", "/contact", "/categories"
    },
    pageName: { type: String, required: true }, // e.g. "Home Page", "About Us"
    metaTitle: { type: String, required: true },
    metaDescription: { type: String, required: true },
    metaKeywords: [{ type: String }],
    canonicalUrl: { type: String, default: "" }, // Defaults to siteUrl + path if empty

    // OpenGraph Overrides
    ogTitle: { type: String, default: "" },
    ogDescription: { type: String, default: "" },
    ogImage: { type: String, default: "" },

    // Twitter Card Overrides
    twitterTitle: { type: String, default: "" },
    twitterDescription: { type: String, default: "" },
    twitterImage: { type: String, default: "" },

    // Robots Directives
    noIndex: { type: Boolean, default: false },
    noFollow: { type: Boolean, default: false },

    // Custom Schema JSON-LD (e.g. FAQPage, BreadcrumbList, LocalBusiness)
    structuredData: { type: String, default: "" },

    // Sitemap Settings
    sitemapPriority: { type: Number, default: 0.8, min: 0.1, max: 1.0 },
    changeFrequency: {
      type: String,
      enum: ["always", "hourly", "daily", "weekly", "monthly", "yearly", "never"],
      default: "weekly",
    },
    includeInSitemap: { type: Boolean, default: true },
    isActive: { type: Boolean, default: true },
  },
  { timestamps: true }
);

module.exports = mongoose.model("SeoPage", seoPageSchema);

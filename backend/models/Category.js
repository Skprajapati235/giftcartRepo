const mongoose = require("mongoose");

const categorySchema = new mongoose.Schema({
  name: { type: String, required: true },
  image: { type: String },
  slug: { type: String, trim: true, lowercase: true },
  seoTitle: { type: String, trim: true },
  seoDescription: { type: String, trim: true },
  seoKeywords: [{ type: String }],
  canonicalUrl: { type: String, trim: true },
  ogImage: { type: String, trim: true },
  headingText: { type: String, trim: true }, // Custom H1 heading
  subheadingText: { type: String, trim: true },
  bottomContent: { type: String, trim: true }, // Rich SEO content block at bottom of category page
  noIndex: { type: Boolean, default: false }
}, { timestamps: true });

module.exports = mongoose.model("Category", categorySchema);
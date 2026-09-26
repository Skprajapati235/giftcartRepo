const mongoose = require("mongoose");

const occasionSchema = new mongoose.Schema(
  {
    name: { type: String, required: true, unique: true, trim: true },
    image: { type: String },
    // Controls whether this shows up in the public navbar list / filters —
    // lets admin retire an occasion without losing its product links.
    isActive: { type: Boolean, default: true },
    slug: { type: String, trim: true, lowercase: true },
    seoTitle: { type: String, trim: true },
    seoDescription: { type: String, trim: true },
    seoKeywords: [{ type: String }],
    headingText: { type: String, trim: true },
    bottomContent: { type: String, trim: true },
    noIndex: { type: Boolean, default: false },
  },
  { timestamps: true }
);

module.exports = mongoose.model("Occasion", occasionSchema);

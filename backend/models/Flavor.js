const mongoose = require("mongoose");

const flavorSchema = new mongoose.Schema({
  name: { type: String, required: true },
  image: { type: String },
  slug: { type: String, trim: true, lowercase: true },
  seoTitle: { type: String, trim: true },
  seoDescription: { type: String, trim: true },
  seoKeywords: [{ type: String }],
  headingText: { type: String, trim: true },
  bottomContent: { type: String, trim: true },
  noIndex: { type: Boolean, default: false }
}, { timestamps: true });

module.exports = mongoose.model("Flavor", flavorSchema);

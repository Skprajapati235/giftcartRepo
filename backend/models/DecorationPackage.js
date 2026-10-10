const mongoose = require("mongoose");

const decorationPackageSchema = new mongoose.Schema(
  {
    title: {
      type: String,
      required: [true, "Package title is required"],
      trim: true,
    },
    slug: {
      type: String,
      required: [true, "Slug is required"],
      unique: true,
      lowercase: true,
      trim: true,
    },
    price: {
      type: Number,
      required: [true, "MRP Price is required"],
      min: 0,
    },
    salePrice: {
      type: Number,
      min: 0,
    },
    category: {
      type: String,
      enum: [
        "Hotel Room Decor",
        "Birthday Party Setup",
        "Romantic Anniversary",
        "Canopy & Cabana",
        "Marry Me / Proposal",
        "Baby Shower & Welcome",
        "Car Boot Surprise",
      ],
      default: "Hotel Room Decor",
    },
    images: {
      type: [String],
      default: [],
    },
    coverImage: {
      type: String,
      default: "",
    },
    summary: {
      type: String,
      default: "",
      trim: true,
    },
    description: {
      type: String,
      default: "",
      trim: true,
    },
    inclusions: {
      type: [String],
      default: [],
    },
    estimatedSetupTime: {
      type: String,
      default: "1.5 to 2 hours",
      trim: true,
    },
    colorThemes: {
      type: [String],
      default: ["Red & Gold", "Rose Gold & White", "Blue & Silver", "Black & Gold", "Pastel Rainbow"],
    },
    availableCities: {
      type: [String],
      default: [], // Empty means available everywhere
    },
    isActive: {
      type: Boolean,
      default: true,
    },
    ratings: {
      type: Number,
      default: 4.9,
    },
    numReviews: {
      type: Number,
      default: 18,
    },
    // SEO Suite
    seoTitle: {
      type: String,
      trim: true,
    },
    seoDescription: {
      type: String,
      trim: true,
    },
    seoKeywords: {
      type: [String],
      default: [],
    },
  },
  {
    timestamps: true,
  }
);

// Indexes
decorationPackageSchema.index({ category: 1, isActive: 1 });

module.exports = mongoose.model("DecorationPackage", decorationPackageSchema);

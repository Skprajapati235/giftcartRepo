const mongoose = require("mongoose");

const testimonialSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: [true, "Customer name is required"],
      trim: true,
    },
    designation: {
      type: String,
      trim: true,
      default: "",
    },
    company: {
      type: String,
      trim: true,
      default: "",
    },
    avatar: {
      type: String,
      trim: true,
      default: "",
    },
    rating: {
      type: Number,
      required: true,
      min: 1,
      max: 5,
      default: 5,
    },
    title: {
      type: String,
      trim: true,
      default: "",
    },
    message: {
      type: String,
      required: [true, "Testimonial message is required"],
      trim: true,
    },
    platform: {
      type: String,
      enum: ["website", "google", "instagram", "facebook", "trustpilot", "other"],
      default: "website",
    },
    videoUrl: {
      type: String,
      trim: true,
      default: "",
    },
    product: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Product",
      default: null,
    },
    order: {
      type: Number,
      default: 0,
    },
    isFeatured: {
      type: Boolean,
      default: false,
    },
    isActive: {
      type: Boolean,
      default: true,
    },
    date: {
      type: Date,
      default: Date.now,
    },
  },
  {
    timestamps: true,
  }
);

// Indexing for faster search and sort
testimonialSchema.index({ isActive: 1, order: 1, createdAt: -1 });
testimonialSchema.index({ isFeatured: 1 });
testimonialSchema.index({ platform: 1 });

module.exports = mongoose.model("Testimonial", testimonialSchema);

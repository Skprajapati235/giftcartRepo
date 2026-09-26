const mongoose = require("mongoose");

const heroSlideSchema = new mongoose.Schema(
  {
    tag: {
      type: String,
      trim: true,
      default: "",
    },
    title: {
      type: String,
      required: true,
      trim: true,
    },
    desc: {
      type: String,
      trim: true,
      default: "",
    },
    cta: {
      type: String,
      trim: true,
      default: "Shop Now",
    },
    categoryMatch: {
      type: String,
      trim: true,
      default: "",
    },
    image: {
      type: String,
      required: true,
      trim: true,
    },
    order: {
      type: Number,
      default: 0,
    },
    isActive: {
      type: Boolean,
      default: true,
    },
  },
  {
    timestamps: true,
    toJSON: { virtuals: true },
    toObject: { virtuals: true },
  }
);

// Virtual field for backwards compatibility with mobile `img` property
heroSlideSchema.virtual("img").get(function () {
  return this.image;
});

module.exports = mongoose.model("HeroSlide", heroSlideSchema);

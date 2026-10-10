const mongoose = require("mongoose");

const decorationSampleSchema = new mongoose.Schema(
  {
    title: {
      type: String,
      required: [true, "Sample title is required"],
      trim: true,
    },
    venueType: {
      type: String,
      enum: [
        "Hotel Room",
        "Home / Bedroom",
        "Cafe / Restaurant",
        "Terrace / Outdoor",
        "Banquet / Hall",
      ],
      default: "Hotel Room",
    },
    hotelOrLocation: {
      type: String,
      default: "",
      trim: true,
    },
    city: {
      type: String,
      default: "Delhi NCR",
      trim: true,
    },
    occasion: {
      type: String,
      default: "Birthday",
    },
    imageUrl: {
      type: String,
      required: [true, "Sample image URL is required"],
      trim: true,
    },
    beforeImageUrl: {
      type: String,
      default: "",
      trim: true,
    },
    caption: {
      type: String,
      default: "",
      trim: true,
    },
    tags: {
      type: [String],
      default: [],
    },
    showOnStorefront: {
      type: Boolean,
      default: true,
    },
    likesCount: {
      type: Number,
      default: 18,
    },
  },
  {
    timestamps: true,
  }
);

decorationSampleSchema.index({ showOnStorefront: 1, createdAt: -1 });

module.exports = mongoose.model("DecorationSample", decorationSampleSchema);

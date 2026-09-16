const mongoose = require("mongoose");

const mediaSchema = new mongoose.Schema(
  {
    url: {
      type: String,
      required: true,
      trim: true,
    },
    public_id: {
      type: String,
      required: true,
      trim: true,
      index: true,
    },
    name: {
      type: String,
      default: "Untitled",
      trim: true,
    },
    format: {
      type: String,
      default: "",
    },
    size: {
      type: Number,
      default: 0,
    },
    width: {
      type: Number,
      default: 0,
    },
    height: {
      type: Number,
      default: 0,
    },
    folder: {
      type: String,
      default: "giftcart",
    },
    folderId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "MediaFolder",
      default: null,
      index: true,
    },
  },
  { timestamps: true }
);

// Index for search by name
mediaSchema.index({ name: "text" });

module.exports = mongoose.model("Media", mediaSchema);

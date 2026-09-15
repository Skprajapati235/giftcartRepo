const mongoose = require("mongoose");

const occasionSchema = new mongoose.Schema(
  {
    name: { type: String, required: true, unique: true, trim: true },
    image: { type: String },
    // Controls whether this shows up in the public navbar list / filters —
    // lets admin retire an occasion without losing its product links.
    isActive: { type: Boolean, default: true },
  },
  { timestamps: true }
);

module.exports = mongoose.model("Occasion", occasionSchema);

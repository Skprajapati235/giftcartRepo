// PATH: backend/models/DecorationColorTheme.js
// Colour themes offered on the booking form (a package can still define its own list). Managed by the admin.
const mongoose = require("mongoose");

const HEX = /^#[0-9a-fA-F]{6}$/;

const schema = new mongoose.Schema(
  {
    name: { type: String, required: true, trim: true, maxlength: 60 },
    description: { type: String, default: "", trim: true, maxlength: 100 },
    primaryColor: { type: String, default: "#D82B76", match: HEX },
    secondaryColor: { type: String, default: "#FFFFFF", match: HEX },
    sortOrder: { type: Number, default: 0 },
    isActive: { type: Boolean, default: true },
  },
  { timestamps: true }
);

schema.index({ name: 1 }, { unique: true, collation: { locale: "en", strength: 2 } });
schema.index({ isActive: 1, sortOrder: 1 });

module.exports = mongoose.models.DecorationColorTheme || mongoose.model("DecorationColorTheme", schema);

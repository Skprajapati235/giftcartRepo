// PATH: backend/models/DecorationVenueType.js
// "Where is the setup?" options (Hotel room, Home, Cafe ...) — managed by the admin in
// Decoration Dashboard → Booking Setup. Customers only ever see the ACTIVE ones.
const mongoose = require("mongoose");

const schema = new mongoose.Schema(
  {
    name: { type: String, required: true, trim: true, maxlength: 60 },
    description: { type: String, default: "", trim: true, maxlength: 140 },
    icon: { type: String, default: "📍", trim: true, maxlength: 8 }, // an emoji
    // true → the booking form also asks for hotel name + room number
    askHotelDetails: { type: Boolean, default: false },
    sortOrder: { type: Number, default: 0 },
    isActive: { type: Boolean, default: true },
  },
  { timestamps: true }
);

schema.index({ name: 1 }, { unique: true, collation: { locale: "en", strength: 2 } }); // case-insensitive unique
schema.index({ isActive: 1, sortOrder: 1 });

module.exports = mongoose.models.DecorationVenueType || mongoose.model("DecorationVenueType", schema);

// PATH: backend/models/DecorationTimeSlot.js
// Setup time windows customers can pick (e.g. 04:00 PM - 06:00 PM). Managed by the admin.
const mongoose = require("mongoose");

const HHMM = /^([01]\d|2[0-3]):[0-5]\d$/;

const schema = new mongoose.Schema(
  {
    // Shown to customers and stored on bookings. Generated from the two times, e.g. "04:00 PM - 06:00 PM".
    label: { type: String, required: true, trim: true, maxlength: 60 },
    startTime: { type: String, required: true, match: HHMM }, // 24h "16:00"
    endTime: { type: String, required: true, match: HHMM }, // 24h "18:00"
    tag: { type: String, default: "", trim: true, maxlength: 40 }, // badge, e.g. "Midnight Surprise"
    // max bookings per date for this slot (0 = unlimited)
    maxBookings: { type: Number, default: 0, min: 0, max: 500 },
    sortOrder: { type: Number, default: 0 },
    isActive: { type: Boolean, default: true },
  },
  { timestamps: true }
);

schema.index({ label: 1 }, { unique: true, collation: { locale: "en", strength: 2 } });
schema.index({ isActive: 1, sortOrder: 1 });

module.exports = mongoose.models.DecorationTimeSlot || mongoose.model("DecorationTimeSlot", schema);

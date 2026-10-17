// PATH: backend/models/DecorationSetting.js
// ONE document with the booking rules. Edited by the admin in Decoration Dashboard → Booking Setup → Rules.
const mongoose = require("mongoose");

const HHMM = /^([01]\d|2[0-3]):[0-5]\d$/;

const schema = new mongoose.Schema(
  {
    key: { type: String, default: "default", unique: true },
    // set once the built-in starter options were inserted — afterwards deleting them stays deleted
    seeded: { type: Boolean, default: false },

    // Customers may type their own setup time (inside the window below)
    allowCustomTimeSlot: { type: Boolean, default: true },
    customSlot: {
      earliest: { type: String, default: "08:00", match: HHMM },
      latest: { type: String, default: "23:00", match: HHMM },
      stepMinutes: { type: Number, default: 30, min: 5, max: 120 },
      defaultDurationMinutes: { type: Number, default: 120, min: 15, max: 720 },
      minDurationMinutes: { type: Number, default: 60, min: 15, max: 720 },
    },

    minLeadHours: { type: Number, default: 3, min: 0, max: 168 },
    maxAdvanceDays: { type: Number, default: 180, min: 1, max: 730 },
    cancelHours: { type: Number, default: 24, min: 0, max: 720 },
    unpaidExpiryMinutes: { type: Number, default: 120, min: 10, max: 2880 },
    maxUnpaidPerUser: { type: Number, default: 3, min: 1, max: 20 },

    // Advance token: percent of the total, never below minAdvanceAmount, rounded to the nearest roundTo
    advancePercent: { type: Number, default: 20, min: 1, max: 100 },
    minAdvanceAmount: { type: Number, default: 299, min: 0, max: 100000 },
    advanceRoundTo: { type: Number, default: 50, min: 1, max: 1000 },

    // Suggestions shown while typing the hotel name
    popularHotels: { type: [String], default: [] },

    supportWhatsapp: { type: String, default: "", trim: true, maxlength: 20 }, // digits with country code, e.g. 918400787712
    supportPhone: { type: String, default: "", trim: true, maxlength: 20 },
  },
  { timestamps: true }
);

module.exports = mongoose.models.DecorationSetting || mongoose.model("DecorationSetting", schema);

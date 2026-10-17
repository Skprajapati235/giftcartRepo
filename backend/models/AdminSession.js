// PATH: backend/models/AdminSession.js
//
// Refresh-token store for the ADMIN PANEL (cookie sessions).
// Only a SHA-256 hash of each refresh token is stored — a database leak can't be replayed.
// Every refresh ROTATES the token (old one is marked used). If an old, already-used token
// shows up again it means it was copied/stolen → the whole "family" (login session) is revoked.

const mongoose = require("mongoose");

const adminSessionSchema = new mongoose.Schema(
  {
    admin: { type: mongoose.Schema.Types.ObjectId, required: true, index: true },
    family: { type: String, required: true, index: true }, // one id per login; shared by all rotations
    tokenHash: { type: String, required: true, unique: true },
    familyStartedAt: { type: Date, required: true },
    expiresAt: { type: Date, required: true },
    usedAt: { type: Date, default: null },
    revokedAt: { type: Date, default: null },
    userAgent: { type: String, default: "" },
    ip: { type: String, default: "" },
  },
  { timestamps: true }
);

// MongoDB removes expired rows automatically
adminSessionSchema.index({ expiresAt: 1 }, { expireAfterSeconds: 0 });

module.exports = mongoose.models.AdminSession || mongoose.model("AdminSession", adminSessionSchema);

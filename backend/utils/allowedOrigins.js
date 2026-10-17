// PATH: backend/utils/allowedOrigins.js
// Single source for the CORS_ORIGINS list (used by CORS and the CSRF guard).

const normalize = (o) => String(o || "").trim().replace(/\/+$/, "");

const allowedOrigins = String(process.env.CORS_ORIGINS || "")
  .split(",")
  .map(normalize)
  .filter(Boolean);

module.exports = { allowedOrigins, normalize };

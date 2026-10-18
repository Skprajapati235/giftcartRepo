// PATH: backend/utils/allowedOrigins.js
// Single source for the CORS_ORIGINS list (used by CORS and the CSRF guard).

const normalize = (o) => String(o || "").trim().replace(/\/+$/, "");

const allowedOrigins = String(process.env.CORS_ORIGINS || "")
  .split(",")
  .map(normalize)
  .filter(Boolean);

const isOriginAllowed = (origin) => {
  if (!origin) return false;
  const clean = normalize(origin);
  if (allowedOrigins.length === 0) return true;
  if (allowedOrigins.includes(clean)) return true;
  // Always permit local development / test origins on any port (localhost / 127.0.0.1)
  if (/^https?:\/\/(localhost|127\.0\.0\.1)(:\d+)?$/i.test(clean)) return true;
  return false;
};

module.exports = { allowedOrigins, normalize, isOriginAllowed };


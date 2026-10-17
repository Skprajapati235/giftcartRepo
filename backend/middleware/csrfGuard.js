// PATH: backend/middleware/csrfGuard.js
//
// Extra CSRF protection for cookie sessions (on top of SameSite=Lax):
// a state-changing request (POST/PUT/PATCH/DELETE) that is authenticated ONLY by the
// session cookie (no Authorization header) must come from one of CORS_ORIGINS.
// Mobile app / API clients use the Authorization header and are not affected.

const { allowedOrigins, normalize } = require("../utils/allowedOrigins");
const { getBearerToken, getCookieToken } = require("../utils/authCookie");

const SAFE = new Set(["GET", "HEAD", "OPTIONS"]);

module.exports = (req, res, next) => {
  if (SAFE.has(req.method)) return next();
  if (allowedOrigins.length === 0) return next(); // not configured → skipped (a warning is logged at startup)
  if (getBearerToken(req) || !getCookieToken(req)) return next(); // not cookie-authenticated

  let origin = normalize(req.headers.origin);
  if (!origin && req.headers.referer) {
    try {
      origin = normalize(new URL(req.headers.referer).origin);
    } catch {
      origin = "";
    }
  }

  if (origin && allowedOrigins.includes(origin)) return next();
  return res.status(403).json({ success: false, message: "Request blocked (origin not allowed)." });
};

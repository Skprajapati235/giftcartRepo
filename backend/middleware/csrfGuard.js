// PATH: backend/middleware/csrfGuard.js
//
// Extra CSRF protection for cookie sessions (on top of SameSite=Lax):
// a state-changing request (POST/PUT/PATCH/DELETE) that is authenticated ONLY by the
// session cookie (no Authorization header) must come from one of CORS_ORIGINS or localhost.
// Mobile app / API clients use the Authorization header and are not affected.

const { isOriginAllowed, normalize, allowedOrigins } = require("../utils/allowedOrigins");
const { getBearerToken, getCookieToken } = require("../utils/authCookie");

const SAFE = new Set(["GET", "HEAD", "OPTIONS"]);

// Endpoints that are explicitly unauthenticated (login/register/otp/webhooks)
// must never be blocked by CSRF checks even if a stale cookie is present in the browser
const AUTH_ENDPOINTS = [
  "/api/admin/auth/login",
  "/api/admin/auth/register",
  "/api/admin/auth/google-login",
  "/api/admin/auth/refresh",
  "/api/auth/login",
  "/api/auth/register",
  "/api/auth/otp",
  "/api/auth/request-otp",
  "/api/auth/verify-otp",
  "/api/webhook",
];

module.exports = (req, res, next) => {
  if (SAFE.has(req.method)) return next();

  // Public unauthenticated endpoints
  const path = (req.originalUrl || req.url || "").toLowerCase();
  if (AUTH_ENDPOINTS.some((p) => path.startsWith(p))) {
    return next();
  }

  if (allowedOrigins.length === 0) return next();
  if (getBearerToken(req) || !getCookieToken(req)) return next(); // not cookie-authenticated

  let origin = normalize(req.headers.origin);
  if (!origin && req.headers.referer) {
    try {
      origin = normalize(new URL(req.headers.referer).origin);
    } catch {
      origin = "";
    }
  }

  if (origin && isOriginAllowed(origin)) return next();
  return res.status(403).json({ success: false, message: "Request blocked (origin not allowed)." });
};

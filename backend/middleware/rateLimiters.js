// PATH: backend/middleware/rateLimiters.js
//
// Basic abuse protection. Limits are per IP (server.js sets `trust proxy`
// so the real client IP is used behind Render).

const rateLimit = require("express-rate-limit");

const make = ({ windowMs, limit, message }) =>
  rateLimit({
    windowMs,
    limit,
    standardHeaders: "draft-7",
    legacyHeaders: false,
    message: { success: false, message },
  });

// Whole API — generous, just stops floods / scrapers
const apiLimiter = make({
  windowMs: 60 * 1000,
  limit: 600,
  message: "Too many requests. Please slow down and try again in a minute.",
});

// Customer OTP send / verify — stops SMS-credit burning and OTP guessing
const customerAuthLimiter = make({
  windowMs: 15 * 60 * 1000,
  limit: 40,
  message: "Too many login attempts. Please try again after 15 minutes.",
});

// Admin login / register / password reset — brute-force protection
const adminAuthLimiter = make({
  windowMs: 15 * 60 * 1000,
  limit: 20,
  message: "Too many admin login attempts. Please try again after 15 minutes.",
});

// Admin session refresh — the panel refreshes every ~15 min per admin; several admins can share one office IP
const adminRefreshLimiter = make({
  windowMs: 15 * 60 * 1000,
  limit: 150,
  message: "Too many session refresh attempts. Please sign in again.",
});

// Decoration booking / pay / cancel — stops spam bookings
const decorationBookingLimiter = make({
  windowMs: 10 * 60 * 1000,
  limit: 40,
  message: "Too many booking attempts. Please try again in a few minutes.",
});

// Public order-tracking links (token lookup)
const trackingLimiter = make({
  windowMs: 60 * 1000,
  limit: 60,
  message: "Too many tracking requests. Please try again in a minute.",
});

// Creating orders / payments
const orderWriteLimiter = make({
  windowMs: 10 * 60 * 1000,
  limit: 40,
  message: "Too many order attempts. Please try again in a few minutes.",
});

module.exports = { apiLimiter, customerAuthLimiter, adminAuthLimiter, adminRefreshLimiter, trackingLimiter, orderWriteLimiter, decorationBookingLimiter };

// PATH: backend/utils/sessionRenewal.js
//
// CUSTOMER sessions (mobile app + website) must never log the user out by themselves.
// Tokens last 365 days AND slide forward: whenever a logged-in customer makes a request and
// their token is more than 7 days old, the server quietly issues a fresh 365-day token.
// So anyone who opens the app at least once a year stays logged in until they press Logout.
//
//   mobile / header clients → new token in the  X-Renewed-Token  response header (the app stores it)
//   website (cookie)        → the httpOnly cookie is simply re-set

const generateToken = require("./generateToken");
const { getBearerToken, setAuthCookie } = require("./authCookie");

const RENEW_AFTER_MS = 7 * 24 * 60 * 60 * 1000;
const STAFF_ROLES = ["super_admin", "admin", "kitchen_manager", "delivery_coordinator", "support_agent", "seo_specialist"];

function maybeRenewCustomerToken(req, res, decoded) {
  try {
    if (!decoded?.id || !decoded.iat) return;
    if (decoded.sid) return; // admin panel sessions are handled by the refresh-token flow
    if (STAFF_ROLES.includes(String(decoded.role || "").toLowerCase())) return;
    if (Date.now() - decoded.iat * 1000 < RENEW_AFTER_MS) return;

    const fresh = generateToken(decoded.id, decoded.role);
    if (getBearerToken(req)) res.setHeader("X-Renewed-Token", fresh);
    else setAuthCookie(res, fresh);
  } catch (err) {
    // renewal is best-effort — never break the request
  }
}

module.exports = { maybeRenewCustomerToken, RENEW_AFTER_MS };

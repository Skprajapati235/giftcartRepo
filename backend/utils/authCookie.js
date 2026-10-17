// PATH: backend/utils/authCookie.js
//
// httpOnly cookie sessions for the WEBSITE and the ADMIN PANEL.
//
// Why: a token kept in localStorage can be stolen by any injected script (XSS).
// A httpOnly cookie can't be read by JavaScript at all.
//
// How it works:
//   • The browser apps send the header  X-Auth-Mode: cookie  on every request.
//   • On login the server then sets the cookie and DOES NOT put the token in the JSON body.
//   • Every auth middleware accepts  Authorization: Bearer <token>  (mobile app, old
//     clients)  OR  the cookie. So nothing existing breaks.
//   • The apps call the API through a same-origin proxy (/backend/* rewrite), so the
//     cookie is first-party (works in Safari / Chrome with third-party cookies blocked).

const jwt = require("jsonwebtoken");

const COOKIE_NAME = "gf_session";

function parseCookies(header) {
  const out = {};
  if (!header || typeof header !== "string") return out;
  header.split(";").forEach((part) => {
    const idx = part.indexOf("=");
    if (idx < 0) return;
    const key = part.slice(0, idx).trim();
    const val = part.slice(idx + 1).trim();
    if (!key) return;
    try {
      out[key] = decodeURIComponent(val);
    } catch {
      out[key] = val;
    }
  });
  return out;
}

function getBearerToken(req) {
  const authHeader = req.headers.authorization;
  if (!authHeader) return null;
  return authHeader.startsWith("Bearer ") ? authHeader.split(" ")[1] : authHeader;
}

function getCookieToken(req) {
  return parseCookies(req.headers.cookie)[COOKIE_NAME] || null;
}

/** Header token first (mobile / legacy), then the session cookie. */
function getTokenFromRequest(req) {
  return getBearerToken(req) || getCookieToken(req);
}

/** true when the caller is a browser app that asked for cookie sessions */
function wantsCookie(req) {
  return String(req.headers["x-auth-mode"] || "").toLowerCase() === "cookie";
}

function cookieOptions(token) {
  const decoded = jwt.decode(token) || {};
  const maxAge = decoded.exp ? Math.max(0, decoded.exp * 1000 - Date.now()) : 7 * 24 * 60 * 60 * 1000;
  return {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    path: "/",
    maxAge,
  };
}

function setAuthCookie(res, token) {
  res.cookie(COOKIE_NAME, token, cookieOptions(token));
}

function clearAuthCookie(res) {
  res.clearCookie(COOKIE_NAME, {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    path: "/",
  });
}

/**
 * Sends a login-style response.
 *   cookie mode  → sets the httpOnly cookie, token is NOT in the body
 *   other        → body includes `token` exactly like before
 */
function sendWithSession(req, res, payload, token, status = 200) {
  if (wantsCookie(req)) {
    setAuthCookie(res, token);
    return res.status(status).json({ ...payload, cookieSession: true });
  }
  return res.status(status).json({ ...payload, token });
}

module.exports = {
  COOKIE_NAME,
  parseCookies,
  getBearerToken,
  getCookieToken,
  getTokenFromRequest,
  wantsCookie,
  setAuthCookie,
  clearAuthCookie,
  sendWithSession,
};

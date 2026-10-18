// PATH: backend/utils/adminSessions.js
//
// ADMIN PANEL SESSIONS — short access token + rotating refresh token, both httpOnly cookies.
//
//   access  cookie  gf_session    JWT, 15 min (ADMIN_ACCESS_TTL)        sent on every request
//   refresh cookie  gf_admin_rt   random 384-bit token, 7 days idle      sent ONLY to /admin/auth/*
//                                 (ADMIN_REFRESH_TTL_DAYS), never longer than 30 days in total
//                                 (ADMIN_SESSION_MAX_DAYS) → admin must log in again after that
//
//   • Refresh tokens rotate on every use; reuse of an old one revokes the whole session (theft detection).
//   • A 15-second grace window stops two browser tabs refreshing at the same moment from killing the session.
//   • Logout / password reset revoke the session on the server immediately (the access token carries `sid`
//     and adminMiddleware checks the session is still active).

const crypto = require("crypto");
const jwt = require("jsonwebtoken");
const AdminSession = require("../models/AdminSession");
const Admin = require("../models/Admin");
const User = require("../models/User");
const { COOKIE_NAME, parseCookies, setAuthCookie, clearAuthCookie } = require("./authCookie");

const REFRESH_COOKIE = "gf_admin_rt";
const GRACE_MS = 15 * 1000;
const VALID_ROLES = ["super_admin", "admin", "kitchen_manager", "delivery_coordinator", "support_agent", "seo_specialist"];

const accessTtl = () => process.env.ADMIN_ACCESS_TTL || "15m";
const refreshDays = () => Number(process.env.ADMIN_REFRESH_TTL_DAYS) || 7;
const maxDays = () => Number(process.env.ADMIN_SESSION_MAX_DAYS) || 30;
// The browser only sends this cookie to the admin auth endpoints (path as the BROWSER sees it, i.e. via the /backend proxy).
const refreshCookiePath = () => process.env.ADMIN_REFRESH_COOKIE_PATH || "/backend/admin/auth";
const isProd = () => process.env.NODE_ENV === "production";

const hash = (token) => crypto.createHash("sha256").update(String(token)).digest("hex");

function signAccess(admin, family) {
  return jwt.sign({ id: String(admin._id), role: admin.role, sid: family }, process.env.JWT_SECRET, {
    expiresIn: accessTtl(),
  });
}

function refreshCookieOptions(maxAgeMs) {
  return {
    httpOnly: true,
    secure: isProd(),
    sameSite: "strict",
    path: refreshCookiePath(),
    maxAge: Math.max(0, maxAgeMs),
  };
}

async function findStaffAccount(id) {
  let account = await Admin.findById(id).select("-password -resetOtpHash -resetOtpExpiresAt");
  if (!account) account = await User.findById(id).select("-password -resetOtpHash -resetOtpExpiresAt");
  return account;
}

async function issue(req, res, admin, { family, familyStartedAt }) {
  const refreshToken = crypto.randomBytes(48).toString("base64url");
  const now = Date.now();
  const expiresAt = new Date(
    Math.min(now + refreshDays() * 86400000, new Date(familyStartedAt).getTime() + maxDays() * 86400000)
  );

  await AdminSession.create({
    admin: admin._id,
    family,
    tokenHash: hash(refreshToken),
    familyStartedAt,
    expiresAt,
    userAgent: String(req.headers["user-agent"] || "").slice(0, 200),
    ip: String(req.ip || "").slice(0, 80),
  });

  const accessToken = signAccess(admin, family);
  setAuthCookie(res, accessToken); // access cookie (maxAge = 15 min, taken from the JWT exp)
  res.cookie(REFRESH_COOKIE, refreshToken, refreshCookieOptions(expiresAt.getTime() - now));
  return accessToken;
}

/** New login → new session family. */
async function startSession(req, res, admin) {
  return await issue(req, res, admin, { family: crypto.randomUUID(), familyStartedAt: new Date() });
}

async function revokeFamily(family) {
  if (!family) return;
  await AdminSession.updateMany({ family, revokedAt: null }, { $set: { revokedAt: new Date() } });
}

/** Password reset / "log out everywhere". */
async function revokeAllForAdmin(adminId) {
  if (!adminId) return;
  await AdminSession.updateMany({ admin: adminId, revokedAt: null }, { $set: { revokedAt: new Date() } });
}

/** Is this login session still allowed? (used by adminMiddleware for tokens that carry `sid`) */
async function isFamilyActive(family) {
  if (!family) return true; // legacy header tokens have no sid
  const row = await AdminSession.exists({ family, revokedAt: null, expiresAt: { $gt: new Date() } });
  return Boolean(row);
}

/**
 * Exchanges a valid refresh cookie for a new access + refresh pair.
 * Returns { ok: true, admin? , grace? } or { ok: false, reason }.
 */
async function rotate(req, res) {
  const raw = parseCookies(req.headers.cookie)[REFRESH_COOKIE];
  if (!raw) return { ok: false, reason: "no_refresh_token" };

  const tokenHash = hash(raw);
  const now = new Date();

  // Atomically "use" the token — only one request can win.
  const claimed = await AdminSession.findOneAndUpdate(
    { tokenHash, usedAt: null, revokedAt: null, expiresAt: { $gt: now } },
    { $set: { usedAt: now } },
    { new: true }
  );

  if (!claimed) {
    const existing = await AdminSession.findOne({ tokenHash });
    if (!existing) return { ok: false, reason: "unknown_token" };
    if (existing.revokedAt || existing.expiresAt <= now) return { ok: false, reason: "expired_or_revoked" };

    // Used a moment ago → almost certainly a second tab racing the first. The cookies the
    // first response set are already in the shared cookie jar, so just say "fine, retry".
    if (existing.usedAt && now - existing.usedAt < GRACE_MS) return { ok: true, grace: true };

    // Used long ago and presented again → the token was copied. Kill the whole session.
    await revokeFamily(existing.family);
    return { ok: false, reason: "reuse_detected" };
  }

  if (now - claimed.familyStartedAt > maxDays() * 86400000) {
    await revokeFamily(claimed.family);
    return { ok: false, reason: "session_max_age" };
  }

  const admin = await findStaffAccount(claimed.admin);
  if (!admin || !VALID_ROLES.includes(String(admin.role || "").toLowerCase().trim())) {
    await revokeFamily(claimed.family);
    return { ok: false, reason: "account_invalid" };
  }

  await issue(req, res, admin, { family: claimed.family, familyStartedAt: claimed.familyStartedAt });
  return { ok: true, admin };
}

function clearRefreshCookie(res) {
  res.clearCookie(REFRESH_COOKIE, {
    httpOnly: true,
    secure: isProd(),
    sameSite: "strict",
    path: refreshCookiePath(),
  });
}

/** Logout: revoke this login session on the server and delete both cookies. */
async function endSession(req, res) {
  try {
    const cookies = parseCookies(req.headers.cookie);
    const raw = cookies[REFRESH_COOKIE];
    if (raw) {
      const row = await AdminSession.findOne({ tokenHash: hash(raw) });
      if (row) await revokeFamily(row.family);
    }
    const access = cookies[COOKIE_NAME];
    const decoded = access ? jwt.decode(access) : null;
    if (decoded?.sid) await revokeFamily(decoded.sid);
  } catch (err) {
    console.warn("[admin-session] revoke on logout failed:", err?.message || err);
  }
  clearAuthCookie(res);
  clearRefreshCookie(res);
}

module.exports = {
  REFRESH_COOKIE,
  GRACE_MS,
  startSession,
  rotate,
  endSession,
  revokeFamily,
  revokeAllForAdmin,
  isFamilyActive,
  clearRefreshCookie,
  signAccess,
};

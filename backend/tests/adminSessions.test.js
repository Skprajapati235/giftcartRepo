// PATH: backend/tests/adminSessions.test.js
// Admin refresh-token rotation, reuse detection, logout revocation and customer sliding renewal.
// The database models are replaced with a tiny in-memory fake, so no MongoDB is needed.

const test = require("node:test");
const assert = require("node:assert/strict");
const jwt = require("jsonwebtoken");

process.env.JWT_SECRET = "test-secret";
process.env.NODE_ENV = "production";

const AdminSession = require("../models/AdminSession");
const Admin = require("../models/Admin");
const User = require("../models/User");

// ---------- in-memory fakes ----------
let rows = [];
const matches = (row, filter) =>
  Object.entries(filter).every(([k, v]) => {
    if (v && typeof v === "object" && "$gt" in v) return row[k] > v.$gt;
    if (v === null) return row[k] === null || row[k] === undefined;
    return String(row[k]) === String(v);
  });

AdminSession.create = async (doc) => { const r = { usedAt: null, revokedAt: null, ...doc }; rows.push(r); return r; };
AdminSession.findOneAndUpdate = async (filter, update) => {
  const r = rows.find((x) => matches(x, filter));
  if (!r) return null;
  Object.assign(r, update.$set);
  return r;
};
AdminSession.findOne = async (filter) => rows.find((x) => matches(x, filter)) || null;
AdminSession.updateMany = async (filter, update) => { rows.filter((x) => matches(x, filter)).forEach((x) => Object.assign(x, update.$set)); };
AdminSession.exists = async (filter) => (rows.some((x) => matches(x, filter)) ? { _id: 1 } : null);

const staff = { _id: "507f1f77bcf86cd799439011", role: "admin", name: "Boss" };
Admin.findById = () => ({ select: async () => staff });
User.findById = () => ({ select: async () => null });

const sessions = require("../utils/adminSessions");

const fakeRes = () => {
  const res = { cookies: {}, cleared: [] };
  res.cookie = (n, v, o) => { res.cookies[n] = { v, o }; return res; };
  res.clearCookie = (n) => { res.cleared.push(n); return res; };
  res.setHeader = (n, v) => { res.cookies["header:" + n] = v; };
  return res;
};
const reqWith = (cookies) => ({
  headers: { cookie: Object.entries(cookies).map(([k, v]) => `${k}=${v}`).join("; "), "user-agent": "test" },
  ip: "1.1.1.1",
});

test.beforeEach(() => { rows = []; });

test("login creates a 15-min access cookie and a strict, path-scoped refresh cookie", async () => {
  const res = fakeRes();
  await sessions.startSession(reqWith({}), res, staff);

  const access = res.cookies.gf_session;
  assert.ok(access.o.httpOnly && access.o.secure);
  const decoded = jwt.verify(access.v, "test-secret");
  assert.equal(decoded.exp - decoded.iat, 15 * 60);
  assert.ok(decoded.sid);

  const refresh = res.cookies[sessions.REFRESH_COOKIE];
  assert.equal(refresh.o.httpOnly, true);
  assert.equal(refresh.o.sameSite, "strict");
  assert.equal(refresh.o.path, "/backend/admin/auth");
  assert.equal(rows.length, 1);
  assert.notEqual(rows[0].tokenHash, refresh.v); // only a hash is stored
});

test("refresh rotates the token and issues new cookies", async () => {
  const login = fakeRes();
  await sessions.startSession(reqWith({}), login, staff);
  const oldRefresh = login.cookies[sessions.REFRESH_COOKIE].v;

  const res = fakeRes();
  const out = await sessions.rotate(reqWith({ [sessions.REFRESH_COOKIE]: oldRefresh }), res);
  assert.equal(out.ok, true);
  assert.ok(res.cookies.gf_session && res.cookies[sessions.REFRESH_COOKIE]);
  assert.notEqual(res.cookies[sessions.REFRESH_COOKIE].v, oldRefresh);
  assert.equal(rows.length, 2);
  assert.ok(rows[0].usedAt);
  assert.equal(rows[0].family, rows[1].family);
});

test("a second tab racing within the grace window is told to retry, not logged out", async () => {
  const login = fakeRes();
  await sessions.startSession(reqWith({}), login, staff);
  const oldRefresh = login.cookies[sessions.REFRESH_COOKIE].v;
  await sessions.rotate(reqWith({ [sessions.REFRESH_COOKIE]: oldRefresh }), fakeRes());

  const res = fakeRes();
  const out = await sessions.rotate(reqWith({ [sessions.REFRESH_COOKIE]: oldRefresh }), res);
  assert.deepEqual({ ok: out.ok, grace: out.grace }, { ok: true, grace: true });
  assert.equal(Object.keys(res.cookies).length, 0); // no new cookies on a grace reply
  assert.equal(await sessions.isFamilyActive(rows[0].family), true);
});

test("re-using an OLD refresh token later revokes the whole session (theft detection)", async () => {
  const login = fakeRes();
  await sessions.startSession(reqWith({}), login, staff);
  const stolen = login.cookies[sessions.REFRESH_COOKIE].v;
  const refreshed = fakeRes();
  await sessions.rotate(reqWith({ [sessions.REFRESH_COOKIE]: stolen }), refreshed);
  const legit = refreshed.cookies[sessions.REFRESH_COOKIE].v;

  rows[0].usedAt = new Date(Date.now() - 60 * 1000); // pretend it was used a minute ago

  const out = await sessions.rotate(reqWith({ [sessions.REFRESH_COOKIE]: stolen }), fakeRes());
  assert.deepEqual({ ok: out.ok, reason: out.reason }, { ok: false, reason: "reuse_detected" });

  // the legitimate newest token is dead too, and the access token's session is no longer active
  const after = await sessions.rotate(reqWith({ [sessions.REFRESH_COOKIE]: legit }), fakeRes());
  assert.equal(after.ok, false);
  assert.equal(await sessions.isFamilyActive(rows[0].family), false);
});

test("logout revokes the session immediately", async () => {
  const login = fakeRes();
  await sessions.startSession(reqWith({}), login, staff);
  const family = rows[0].family;
  const res = fakeRes();
  await sessions.endSession(
    reqWith({ [sessions.REFRESH_COOKIE]: login.cookies[sessions.REFRESH_COOKIE].v, gf_session: login.cookies.gf_session.v }),
    res
  );
  assert.equal(await sessions.isFamilyActive(family), false);
  assert.ok(res.cleared.includes("gf_session") && res.cleared.includes(sessions.REFRESH_COOKIE));
});

test("a session older than ADMIN_SESSION_MAX_DAYS cannot be refreshed", async () => {
  const login = fakeRes();
  await sessions.startSession(reqWith({}), login, staff);
  rows[0].familyStartedAt = new Date(Date.now() - 31 * 86400000);
  const out = await sessions.rotate(reqWith({ [sessions.REFRESH_COOKIE]: login.cookies[sessions.REFRESH_COOKIE].v }), fakeRes());
  assert.deepEqual({ ok: out.ok, reason: out.reason }, { ok: false, reason: "session_max_age" });
});

test("missing / unknown / removed-account refresh is rejected", async () => {
  assert.equal((await sessions.rotate(reqWith({}), fakeRes())).ok, false);
  assert.equal((await sessions.rotate(reqWith({ [sessions.REFRESH_COOKIE]: "nope" }), fakeRes())).reason, "unknown_token");

  const login = fakeRes();
  await sessions.startSession(reqWith({}), login, staff);
  const original = Admin.findById;
  Admin.findById = () => ({ select: async () => null });
  const out = await sessions.rotate(reqWith({ [sessions.REFRESH_COOKIE]: login.cookies[sessions.REFRESH_COOKIE].v }), fakeRes());
  Admin.findById = original;
  assert.equal(out.reason, "account_invalid");
});

// ---------- customer sliding session ----------
const { maybeRenewCustomerToken } = require("../utils/sessionRenewal");
const tokenAged = (days, extra = {}) => jwt.decode(jwt.sign({ id: "u1", role: "user", iat: Math.floor(Date.now() / 1000) - days * 86400, ...extra }, "test-secret"));

test("customer token older than 7 days is renewed for 365 days (header client)", () => {
  const res = fakeRes();
  maybeRenewCustomerToken({ headers: { authorization: "Bearer x" } }, res, tokenAged(10));
  const fresh = res.cookies["header:X-Renewed-Token"];
  assert.ok(fresh);
  const d = jwt.verify(fresh, "test-secret");
  assert.equal(Math.round((d.exp - d.iat) / 86400), 365);
});

test("cookie client gets the cookie re-set; fresh tokens, staff and admin sessions are not renewed", () => {
  const a = fakeRes();
  maybeRenewCustomerToken({ headers: { cookie: "gf_session=x" } }, a, tokenAged(10));
  assert.ok(a.cookies.gf_session);

  const b = fakeRes(); maybeRenewCustomerToken({ headers: { authorization: "Bearer x" } }, b, tokenAged(2));
  const c = fakeRes(); maybeRenewCustomerToken({ headers: { authorization: "Bearer x" } }, c, tokenAged(10, { role: "admin" }));
  const d = fakeRes(); maybeRenewCustomerToken({ headers: { authorization: "Bearer x" } }, d, tokenAged(10, { sid: "abc" }));
  [b, c, d].forEach((r) => assert.equal(Object.keys(r.cookies).length, 0));
});

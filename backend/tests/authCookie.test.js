// PATH: backend/tests/authCookie.test.js
const test = require("node:test");
const assert = require("node:assert/strict");
const jwt = require("jsonwebtoken");

process.env.JWT_SECRET = "test-secret";
process.env.CORS_ORIGINS = "https://giftfestive.com,https://giftcart-repo.vercel.app";

const {
  parseCookies, getTokenFromRequest, wantsCookie, sendWithSession, COOKIE_NAME,
} = require("../utils/authCookie");
const csrfGuard = require("../middleware/csrfGuard");
const authMiddleware = require("../middleware/authMiddleware");

const fakeRes = () => {
  const res = { headers: {}, cookies: {}, statusCode: 200, body: null };
  res.cookie = (n, v, o) => { res.cookies[n] = { v, o }; return res; };
  res.status = (c) => { res.statusCode = c; return res; };
  res.json = (b) => { res.body = b; return res; };
  return res;
};

test("parseCookies handles encoding and missing header", () => {
  assert.deepEqual(parseCookies(undefined), {});
  assert.equal(parseCookies("a=1; gf_session=abc%2E123; b=2").gf_session, "abc.123");
});

test("header token wins over cookie; cookie works alone", () => {
  assert.equal(getTokenFromRequest({ headers: { authorization: "Bearer H", cookie: `${COOKIE_NAME}=C` } }), "H");
  assert.equal(getTokenFromRequest({ headers: { cookie: `${COOKIE_NAME}=C` } }), "C");
  assert.equal(getTokenFromRequest({ headers: {} }), null);
});

test("cookie mode: token goes in httpOnly cookie, NOT in the body", () => {
  const token = jwt.sign({ id: "u1", role: "user" }, "test-secret", { expiresIn: "1d" });
  const res = fakeRes();
  sendWithSession({ headers: { "x-auth-mode": "cookie" } }, res, { success: true }, token);
  assert.equal(res.body.token, undefined);
  assert.equal(res.body.cookieSession, true);
  assert.equal(res.cookies[COOKIE_NAME].v, token);
  assert.equal(res.cookies[COOKIE_NAME].o.httpOnly, true);
  assert.equal(res.cookies[COOKIE_NAME].o.sameSite, "lax");
});

test("mobile mode (no header): token is still in the body", () => {
  const res = fakeRes();
  sendWithSession({ headers: {} }, res, { success: true }, "TKN");
  assert.equal(res.body.token, "TKN");
  assert.equal(Object.keys(res.cookies).length, 0);
  assert.equal(wantsCookie({ headers: {} }), false);
});

test("authMiddleware accepts a valid cookie and rejects a bad one", () => {
  const good = jwt.sign({ id: "u1", role: "user" }, "test-secret");
  const req = { headers: { cookie: `${COOKIE_NAME}=${good}` } };
  let nexted = false;
  authMiddleware(req, fakeRes(), () => { nexted = true; });
  assert.equal(nexted, true);
  assert.equal(req.user.id, "u1");

  const res = fakeRes();
  authMiddleware({ headers: { cookie: `${COOKIE_NAME}=garbage` } }, res, () => assert.fail("should not pass"));
  assert.equal(res.statusCode, 401);
});

test("csrfGuard: blocks cookie-authenticated POST from unknown origin, allows known/GET/bearer", () => {
  const run = (req) => { const res = fakeRes(); let ok = false; csrfGuard(req, res, () => { ok = true; }); return { ok, res }; };
  const cookie = `${COOKIE_NAME}=x`;

  assert.equal(run({ method: "POST", headers: { cookie, origin: "https://evil.com" } }).ok, false);
  assert.equal(run({ method: "POST", headers: { cookie } }).ok, false); // no origin at all
  assert.equal(run({ method: "POST", headers: { cookie, origin: "https://giftfestive.com" } }).ok, true);
  assert.equal(run({ method: "DELETE", headers: { cookie, referer: "https://giftcart-repo.vercel.app/orders" } }).ok, true);
  assert.equal(run({ method: "GET", headers: { cookie, origin: "https://evil.com" } }).ok, true);
  assert.equal(run({ method: "POST", headers: { authorization: "Bearer t", cookie, origin: "https://evil.com" } }).ok, true);
  assert.equal(run({ method: "POST", headers: { origin: "https://evil.com" } }).ok, true); // no cookie session → nothing to forge
});

// PATH: backend/tests/decoration.test.js
// Decoration booking rules: login required, validation, payment-after-booking, ownership, cancel window,
// tracking privacy. Database models and the payment gateway are replaced by small fakes (no MongoDB needed).

const test = require("node:test");
const assert = require("node:assert/strict");
const crypto = require("crypto");

process.env.JWT_SECRET = "test-secret";
process.env.RAZORPAY_KEY_SECRET = "rzp-secret";

const DecorationBooking = require("../models/DecorationBooking");
const DecorationPackage = require("../models/DecorationPackage");
const emailService = require("../utils/emailService");
const paymentService = require("../services/paymentService");
const optionsService = require("../services/decoration/decorationOptionsService");
const service = require("../services/decoration/decorationBookingService");
const controllerModule = require("../controllers/decoration");
const { assertSetupWindow, toCustomerView, generateBookingId } = service.helpers;

// ----- no real e-mails in tests -----
const mails = [];
emailService.sendDecorationBookingNotification = async (b) => { mails.push(["booking", b.bookingId]); };
emailService.sendDecorationAdminAlert = async (b, h) => { mails.push(["admin", h]); };
emailService.sendDecorationCustomerUpdate = async (b, h) => { mails.push(["customer", h]); };

const NOW = Date.UTC(2026, 9, 14, 6, 0, 0); // 14 Oct 2026, 11:30 IST (only for the pure date-rule test)
const futureDate = (days) => new Date(NOW + days * 86400000 + 330 * 60000).toISOString().slice(0, 10);
// dates relative to the REAL clock, so these tests keep passing whenever they are run
const realFuture = (days) => new Date(Date.now() + days * 86400000 + 330 * 60000).toISOString().slice(0, 10);

// The booking options (venue / slot / theme) are covered in decorationOptions.test.js — here they are simple fakes
optionsService.getSettings = async () => optionsService.peekSettings();
optionsService.resolveVenue = async ({ venueType, hotelName, roomNumber }) => ({
  name: venueType || "Hotel Room", hotelName: hotelName || "", roomNumber: roomNumber || "", askHotelDetails: false,
});
optionsService.resolveTimeSlot = async ({ setupTimeSlot, setupDate }, { isStaff } = {}) => {
  if (!isStaff) optionsService.assertSetupWindow(setupDate, setupTimeSlot);
  return { label: setupTimeSlot, isCustom: false, startTime: "", endTime: "", slotId: null, maxBookings: 0 };
};
optionsService.resolveColorTheme = async (name) => name || "";

// ---------- pure rules ----------
test("setup date / time window", () => {
  const ok = futureDate(3);
  assert.doesNotThrow(() => assertSetupWindow(ok, "04:00 PM - 06:00 PM", NOW));
  assert.throws(() => assertSetupWindow(futureDate(-1), "04:00 PM - 06:00 PM", NOW), /past/);
  assert.throws(() => assertSetupWindow("2026-02-31", "04:00 PM - 06:00 PM", NOW), /valid setup date/);
  assert.throws(() => assertSetupWindow("tomorrow", "04:00 PM - 06:00 PM", NOW), /valid setup date/);
  assert.throws(() => assertSetupWindow(futureDate(400), "04:00 PM - 06:00 PM", NOW), /in advance/);
  // today 11:30 IST → a 12:00 PM start is less than 3 hours away, 04:00 PM is fine
  assert.throws(() => assertSetupWindow(futureDate(0), "12:00 PM - 02:00 PM", NOW), /at least 3 hours/);
  assert.doesNotThrow(() => assertSetupWindow(futureDate(0), "04:00 PM - 06:00 PM", NOW));
});

test("booking ids are well formed and don't collide", () => {
  const seen = new Set();
  for (let i = 0; i < 5000; i += 1) {
    const id = generateBookingId();
    assert.match(id, /^DEC-\d{6}-[A-Z2-9]{6}$/);
    seen.add(id);
  }
  assert.equal(seen.size, 5000);
});

const rawBooking = (over = {}) => ({
  _id: "507f1f77bcf86cd799439011",
  bookingId: "DEC-261014-ABC234",
  user: "user1",
  packageTitle: "Birthday Surprise",
  status: "Confirmed",
  paymentType: "Advance Downpayment",
  paymentStatus: "Pending",
  downpaymentStatus: "Pending",
  totalAmount: 3000,
  advanceAmount: 600,
  balanceAmount: 2400,
  setupDate: realFuture(5),
  setupTimeSlot: "04:00 PM - 06:00 PM",
  adminNotes: "SECRET NOTE",
  decoratorPayout: 999,
  razorpayOrderId: "order_x",
  razorpaySignature: "sig",
  addons: [],
  ...over,
});

test("customer view hides admin/gateway fields and computes pay/cancel flags", () => {
  const v = toCustomerView(rawBooking());
  assert.equal(v.adminNotes, undefined);
  assert.equal(v.decoratorPayout, undefined);
  assert.equal(v.razorpaySignature, undefined);
  assert.equal(v.canPay, true);
  assert.equal(v.payAmount, 600);
  assert.equal(v.canCancel, true);

  const paid = toCustomerView(rawBooking({ paymentStatus: "Advance Paid", downpaymentStatus: "Paid" }));
  assert.equal(paid.canPay, false);

  // too close to the setup → can't cancel online once it is paid
  const soon = toCustomerView(rawBooking({ setupDate: new Date().toISOString().slice(0, 10), downpaymentStatus: "Paid", paymentStatus: "Advance Paid" }));
  assert.equal(soon.canCancel, false);

  const cancelled = toCustomerView(rawBooking({ status: "Cancelled" }));
  assert.equal(cancelled.canPay, false);
  assert.equal(cancelled.canCancel, false);

  const cod = toCustomerView(rawBooking({ paymentType: "Full COD" }));
  assert.equal(cod.canPay, false);
});

// ---------- createBooking ----------
const PKG_ID = "507f1f77bcf86cd799439013";
const pkg = { _id: PKG_ID, title: "Birthday Surprise", price: 3000, salePrice: 3000, coverImage: "" };
let saved = [];
let existsResult = null;
let unpaidCount = 0;

DecorationPackage.findById = async () => pkg;
DecorationBooking.exists = async () => existsResult;
DecorationBooking.countDocuments = async () => unpaidCount;
DecorationBooking.prototype.save = async function save() { saved.push(this); return this; };

test.beforeEach(() => { saved = []; existsResult = null; unpaidCount = 0; mails.length = 0; });

const goodPayload = (over = {}) => ({
  packageId: PKG_ID,
  venueAddress: "Room 305, Hotel Delite, Sector 15, Faridabad",
  setupDate: realFuture(4),
  setupTimeSlot: "06:00 PM - 08:00 PM",
  customerName: "Riya Sharma",
  customerPhone: "+91 98765 43210",
  paymentType: "Advance Downpayment",
  ...over,
});
const USER_ID = "507f1f77bcf86cd799439012"; // a real ObjectId, because createBooking builds a real mongoose document
const ctx = { userId: USER_ID, isStaff: false };

test("online booking is saved as Pending until payment is verified (never 'Paid' on the client's word)", async () => {
  const b = await service.createBooking(goodPayload({ paymentStatus: "Paid", totalAmount: 1, advanceAmount: 1 }), ctx);
  assert.equal(b.status, "Pending");
  assert.equal(b.paymentStatus, "Pending");
  assert.equal(b.totalAmount, 3000); // from the DB, not the client
  assert.equal(b.advanceAmount, 600);
  assert.equal(String(b.user), USER_ID);
  assert.equal(b.customerPhone, "9876543210");
  assert.ok(b.paymentDueBy > new Date());
  assert.equal(mails.length, 0); // admin hears about it once it is paid
});

test("a demo/fallback package id gets a friendly error, not a database cast error", async () => {
  await assert.rejects(() => service.createBooking(goodPayload({ packageId: "fallback-pkg-1" }), ctx), /refresh the page/);
});

test("COD booking is confirmed immediately and announced", async () => {
  const b = await service.createBooking(goodPayload({ paymentType: "Full COD" }), ctx);
  assert.equal(b.status, "Confirmed");
  assert.equal(b.paymentDueBy, null);
  await new Promise((r) => setImmediate(r));
  assert.equal(mails.length, 1);
});

test("validation: phone, past date, duplicates, unpaid limit", async () => {
  await assert.rejects(() => service.createBooking(goodPayload({ customerPhone: "123" }), ctx), /10-digit/);
  await assert.rejects(() => service.createBooking(goodPayload({ setupDate: realFuture(-2) }), ctx), /past/);
  await assert.rejects(() => service.createBooking(goodPayload({ customerEmail: "not-an-email" }), ctx), /email/);
  await assert.rejects(() => service.createBooking(goodPayload({ venueAddress: "x" }), ctx), /address/);

  existsResult = { _id: "dup" };
  await assert.rejects(() => service.createBooking(goodPayload(), ctx), /already have a booking/);
  existsResult = null;

  unpaidCount = 3;
  await assert.rejects(() => service.createBooking(goodPayload(), ctx), /unpaid bookings/);
  assert.equal(saved.length, 0);
});

test("staff can enter a same-day job on a customer's behalf (not linked to an account)", async () => {
  const b = await service.createBooking(
    goodPayload({ setupDate: realFuture(0), setupTimeSlot: "11:00 AM - 01:00 PM", paymentType: "Full COD" }),
    { userId: null, isStaff: true }
  );
  assert.equal(b.user, null);
  assert.equal(b.status, "Confirmed");
});

test("booking id collisions are retried", async () => {
  let calls = 0;
  const original = DecorationBooking.prototype.save;
  DecorationBooking.prototype.save = async function save() {
    calls += 1;
    if (calls < 3) { const e = new Error("E11000 duplicate key bookingId"); e.code = 11000; throw e; }
    return this;
  };
  const b = await service.createBooking(goodPayload({ paymentType: "Full COD" }), ctx);
  DecorationBooking.prototype.save = original;
  assert.equal(calls, 3);
  assert.ok(b.bookingId);
});

// ---------- the controller requires a login ----------
const fakeRes = () => {
  const res = { statusCode: 200, body: null };
  res.status = (c) => { res.statusCode = c; return res; };
  res.json = (b) => { res.body = b; return res; };
  return res;
};

test("controller refuses a booking without a logged-in user", async () => {
  const res = fakeRes();
  await controllerModule.decorationBookingController.createBooking({ body: goodPayload(), user: undefined }, res);
  assert.equal(res.statusCode, 401);
});

// ---------- paying an existing booking ----------
const makeDoc = (over = {}) => {
  const doc = { ...rawBooking(over), save: async function save() { return this; }, toObject() { const { save, toObject, ...rest } = this; return { ...rest }; } };
  return doc;
};
const sign = (orderId, paymentId, secret = "rzp-secret") => crypto.createHmac("sha256", secret).update(`${orderId}|${paymentId}`).digest("hex");

test("payment: owner only, our own order id, valid signature, enough money, one-time payment id", async () => {
  const doc = makeDoc({ status: "Pending", razorpayOrderId: "order_1" });
  DecorationBooking.findOne = async (q) => (q.user === "user1" ? doc : null);
  paymentService.fetchRazorpayOrder = async () => ({ amount: 60000 });

  const good = { bookingId: doc.bookingId, razorpay_order_id: "order_1", razorpay_payment_id: "pay_1", razorpay_signature: sign("order_1", "pay_1") };

  await assert.rejects(() => service.verifyBookingPayment("someone-else", good), /not found/i);
  await assert.rejects(() => service.verifyBookingPayment("user1", { ...good, razorpay_order_id: "order_OTHER", razorpay_signature: sign("order_OTHER", "pay_1") }), /does not belong/);
  await assert.rejects(() => service.verifyBookingPayment("user1", { ...good, razorpay_signature: "deadbeef" }), /signature/);

  paymentService.fetchRazorpayOrder = async () => ({ amount: 100 });
  await assert.rejects(() => service.verifyBookingPayment("user1", good), /lower than/);

  paymentService.fetchRazorpayOrder = async () => ({ amount: 60000 });
  DecorationBooking.exists = async () => ({ _id: "another-booking" });
  await assert.rejects(() => service.verifyBookingPayment("user1", good), /already been used/);

  DecorationBooking.exists = async () => null;
  const view = await service.verifyBookingPayment("user1", good);
  assert.equal(view.status, "Confirmed");
  assert.equal(view.paymentStatus, "Advance Paid");
  assert.equal(doc.razorpayPaymentId, "pay_1");
  assert.equal(mails.filter((m) => m[0] === "booking").length, 1);

  // calling it again must not break or re-announce
  const again = await service.verifyBookingPayment("user1", good);
  assert.equal(again.paymentStatus, "Advance Paid");
  assert.equal(mails.filter((m) => m[0] === "booking").length, 1);
});

test("webhook marks a booking paid (and reinstates one released by the unpaid timer)", async () => {
  const doc = makeDoc({ status: "Cancelled", cancelledBy: "system", razorpayOrderId: "order_w" });
  DecorationBooking.findOne = async () => doc;
  const tooLow = await service.markPaidByWebhook("order_w", "pay_w", 100);
  assert.equal(tooLow.paymentStatus, "Pending");

  const done = await service.markPaidByWebhook("order_w", "pay_w", 60000);
  assert.equal(done.status, "Confirmed");
  assert.equal(done.paymentStatus, "Advance Paid");

  DecorationBooking.findOne = async () => null;
  assert.equal(await service.markPaidByWebhook("unknown", "p", 1), null);
});

test("payment that arrives after the CUSTOMER cancelled alerts the admin instead of reviving the booking", async () => {
  const doc = makeDoc({ status: "Cancelled", cancelledBy: "customer", razorpayOrderId: "order_c" });
  DecorationBooking.findOne = async () => doc;
  const out = await service.markPaidByWebhook("order_c", "pay_c", 60000);
  assert.equal(out.status, "Cancelled");
  assert.ok(mails.some((m) => m[0] === "admin" && /refund/i.test(m[1])));
});

// ---------- creating the payment order ----------
test("payment order amount comes from the saved booking", async () => {
  const doc = makeDoc({ status: "Pending" });
  DecorationBooking.findOne = async () => doc;
  paymentService.createRazorpayOrder = async (amount) => ({ id: `order_for_${amount}` });
  const out = await service.createPaymentOrderForBooking("user1", doc.bookingId);
  assert.equal(out.amountToCharge, 600);
  assert.equal(doc.razorpayOrderId, "order_for_600");

  const full = makeDoc({ paymentType: "Full Online", status: "Pending" });
  DecorationBooking.findOne = async () => full;
  assert.equal((await service.createPaymentOrderForBooking("user1", full.bookingId)).amountToCharge, 3000);

  const paid = makeDoc({ paymentStatus: "Advance Paid", downpaymentStatus: "Paid" });
  DecorationBooking.findOne = async () => paid;
  await assert.rejects(() => service.createPaymentOrderForBooking("user1", paid.bookingId), /already complete/);

  const cod = makeDoc({ paymentType: "Full COD" });
  DecorationBooking.findOne = async () => cod;
  await assert.rejects(() => service.createPaymentOrderForBooking("user1", cod.bookingId), /pay-on-setup/);

  const dead = makeDoc({ status: "Cancelled" });
  DecorationBooking.findOne = async () => dead;
  await assert.rejects(() => service.createPaymentOrderForBooking("user1", dead.bookingId), /cancelled or expired/);
});

// ---------- cancelling ----------
test("customer cancellation follows the policy window", async () => {
  const ok = makeDoc({ status: "Confirmed", downpaymentStatus: "Paid", paymentStatus: "Advance Paid" });
  DecorationBooking.findOne = async () => ok;
  const out = await service.cancelMyBooking("user1", ok.bookingId, "Plans changed");
  assert.equal(out.status, "Cancelled");
  assert.equal(ok.cancelledBy, "customer");
  assert.match(ok.adminNotes, /refund/i);
  assert.ok(mails.some((m) => m[0] === "admin") && mails.some((m) => m[0] === "customer"));

  const tooLate = makeDoc({
    status: "Confirmed", downpaymentStatus: "Paid", paymentStatus: "Advance Paid",
    setupDate: new Date().toISOString().slice(0, 10), setupTimeSlot: "11:59 PM - 11:59 PM",
  });
  DecorationBooking.findOne = async () => tooLate;
  await assert.rejects(() => service.cancelMyBooking("user1", tooLate.bookingId), /can no longer be cancelled/);

  const inSetup = makeDoc({ status: "In Setup" });
  DecorationBooking.findOne = async () => inSetup;
  await assert.rejects(() => service.cancelMyBooking("user1", inSetup.bookingId), /can no longer be cancelled/);

  DecorationBooking.findOne = async () => null;
  await assert.rejects(() => service.cancelMyBooking("intruder", "DEC-X"), /not found/i);
});

test("unpaid bookings are released by the timer (only unpaid, online, past their deadline)", async () => {
  let filter; let update;
  DecorationBooking.updateMany = async (f, u) => { filter = f; update = u; return { modifiedCount: 2 }; };
  assert.equal(await service.expireUnpaidBookings(), 2);
  assert.equal(filter.status, "Pending");
  assert.equal(filter.paymentStatus, "Pending");
  assert.deepEqual(filter.paymentType, { $in: ["Full Online", "Advance Downpayment"] });
  assert.equal(update.$set.cancelledBy, "system");
});

// ---------- public tracking ----------
test("public tracking needs the booking phone; the owner doesn't", async () => {
  const doc = { ...rawBooking({ user: "user1", customerPhone: "9876543210", customerName: "Riya" }), assignedPartner: null };
  DecorationBooking.findOne = () => ({ populate: async () => doc });

  await assert.rejects(() => service.trackBooking("DEC-261014-ABC234", "", undefined), /not found/i);
  await assert.rejects(() => service.trackBooking("DEC-261014-ABC234", "9999999999", undefined), /not found/i);
  assert.ok(await service.trackBooking("DEC-261014-ABC234", "+91 98765-43210", undefined));
  assert.ok(await service.trackBooking("DEC-261014-ABC234", "", "user1"));
  await assert.rejects(() => service.trackBooking("DEC-261014-ABC234", "", "other-user"), /not found/i);
});


// ---------- my bookings ----------
const User = require("../models/User");

test("my bookings: returns only safe fields and attaches earlier bookings made with the verified phone", async () => {
  let claim;
  User.findById = () => ({ select: async () => ({ mobileNumber: "+91 98765 43210" }) });
  DecorationBooking.updateMany = async (f, u) => { claim = { f, u }; return {}; };
  DecorationBooking.find = () => ({ sort: () => ({ limit: async () => [makeDoc({ status: "Pending" })] }) });

  const rows = await service.getMyBookings("user1");
  assert.equal(claim.f.user, null);
  assert.equal(claim.f.customerPhone.$regex, "9876543210$");
  assert.equal(claim.u.$set.user, "user1");
  assert.equal(rows.length, 1);
  assert.equal(rows[0].adminNotes, undefined);
  assert.equal(rows[0].canPay, true);
  await assert.rejects(() => service.getMyBookings(undefined), /log in/);
});

test("staff-entered online bookings are confirmed and never auto-released", async () => {
  const b = await service.createBooking(goodPayload({ paymentType: "Advance Downpayment" }), { userId: null, isStaff: true });
  assert.equal(b.status, "Confirmed");
  assert.equal(b.paymentDueBy, null);
});

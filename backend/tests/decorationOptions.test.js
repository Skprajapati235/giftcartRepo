// PATH: backend/tests/decorationOptions.test.js
// Admin-managed booking options: venue types, time slots (+ custom time), colour themes, rules.
// Models are replaced by small in-memory fakes (no MongoDB needed).

const test = require("node:test");
const assert = require("node:assert/strict");

const VenueType = require("../models/DecorationVenueType");
const TimeSlot = require("../models/DecorationTimeSlot");
const ColorTheme = require("../models/DecorationColorTheme");
const Setting = require("../models/DecorationSetting");
const DecorationBooking = require("../models/DecorationBooking");
const options = require("../services/decoration/decorationOptionsService");

// chainable + awaitable fake of a mongoose query
const q = (value) => {
  const o = {
    lean: async () => value,
    select: () => o,
    sort: () => o,
    then: (res, rej) => Promise.resolve(value).then(res, rej),
  };
  return o;
};

let settingsDoc;
const baseSettings = () => ({
  key: "default", seeded: true, allowCustomTimeSlot: true,
  customSlot: { earliest: "08:00", latest: "23:00", stepMinutes: 30, defaultDurationMinutes: 120, minDurationMinutes: 60 },
  minLeadHours: 3, maxAdvanceDays: 180, cancelHours: 24, unpaidExpiryMinutes: 120, maxUnpaidPerUser: 3,
  advancePercent: 20, minAdvanceAmount: 299, advanceRoundTo: 50, popularHotels: ["Hotel A"], supportWhatsapp: "918400787712", supportPhone: "",
});
Setting.findOne = () => q(settingsDoc);
Setting.updateOne = async (_f, u) => {
  for (const [k, v] of Object.entries(u.$set)) {
    if (k.startsWith("customSlot.")) settingsDoc.customSlot[k.split(".")[1]] = v;
    else settingsDoc[k] = v;
  }
};

test.beforeEach(() => {
  settingsDoc = baseSettings();
  options.invalidateSettings();
});

const NOW = Date.UTC(2026, 9, 14, 6, 0, 0); // 14 Oct 2026 11:30 IST
const day = (n) => new Date(NOW + n * 86400000 + 330 * 60000).toISOString().slice(0, 10);

// ───────────── advance token ─────────────
test("advance token follows the admin's percent / minimum / rounding", () => {
  const s = baseSettings();
  assert.equal(options.computeAdvance(3000, s), 600);
  assert.equal(options.computeAdvance(1000, s), 299); // 200 → below the minimum
  assert.equal(options.computeAdvance(100, s), 100); // never more than the total
  assert.equal(options.computeAdvance(3000, { ...s, advancePercent: 50 }), 1500);
  assert.equal(options.computeAdvance(1234, { ...s, advancePercent: 30, advanceRoundTo: 100 }), 400);
});

// ───────────── venue types ─────────────
test("venue: must be an active option; hotel details only when the type asks for them", async () => {
  const hotel = { _id: "507f1f77bcf86cd799439021", name: "Hotel Room", askHotelDetails: true, isActive: true };
  const home = { _id: "507f1f77bcf86cd799439022", name: "Home / Flat", askHotelDetails: false, isActive: true };
  VenueType.findOne = (f) => {
    const hit = [hotel, home].find((v) => (f._id && f._id === v._id) || (f.name && new RegExp(f.name.$regex, f.name.$options).test(v.name)));
    return q(hit || null);
  };

  const byId = await options.resolveVenue({ venueTypeId: home._id, hotelName: "ignored", roomNumber: "9" });
  assert.deepEqual(byId, { name: "Home / Flat", askHotelDetails: false, hotelName: "", roomNumber: "" });

  const byName = await options.resolveVenue({ venueType: "hotel room", hotelName: "Hotel Delite", roomNumber: "305" });
  assert.equal(byName.name, "Hotel Room");
  assert.equal(byName.hotelName, "Hotel Delite");

  await assert.rejects(() => options.resolveVenue({ venueType: "Hotel Room", hotelName: "" }), /hotel name/i);
  await assert.rejects(() => options.resolveVenue({ venueType: "Moon Base" }), /venue type/i);
  await assert.rejects(() => options.resolveVenue({}), /venue type/i);

  // staff entering a booking may type a free venue name
  const staff = await options.resolveVenue({ venueType: "Farmhouse" }, { isStaff: true });
  assert.equal(staff.name, "Farmhouse");
});

// ───────────── time slots ─────────────
const slotA = { _id: "507f1f77bcf86cd799439031", label: "04:00 PM - 06:00 PM", startTime: "16:00", endTime: "18:00", isActive: true, maxBookings: 0 };
const slotCap = { _id: "507f1f77bcf86cd799439032", label: "08:00 PM - 10:00 PM", startTime: "20:00", endTime: "22:00", isActive: true, maxBookings: 2 };

const stubSlots = () => {
  TimeSlot.findOne = (f) => {
    const hit = [slotA, slotCap].find((s) => (f._id && f._id === s._id) || (f.label && new RegExp(f.label.$regex, f.label.$options).test(s.label)));
    return q(hit || null);
  };
};

test("time slot: chosen by id or label, notice period enforced", async () => {
  stubSlots();
  DecorationBooking.countDocuments = async () => 0;

  const r = await options.resolveTimeSlot({ timeSlotId: slotA._id, setupDate: day(3) }, { now: NOW });
  assert.equal(r.label, slotA.label);
  assert.equal(r.isCustom, false);

  const byLabel = await options.resolveTimeSlot({ setupTimeSlot: "04:00 pm - 06:00 pm", setupDate: day(3) }, { now: NOW });
  assert.equal(byLabel.label, slotA.label);

  await assert.rejects(() => options.resolveTimeSlot({ setupTimeSlot: "03:00 AM - 05:00 AM", setupDate: day(3) }, { now: NOW }), /time slot/i);
  await assert.rejects(() => options.resolveTimeSlot({ timeSlotId: slotA._id, setupDate: day(-1) }, { now: NOW }), /past/i);
  // today, slot starts 16:00 and it's 11:30 IST → 4.5 h away → fine; but 3 h notice vs a 12:00 start would fail
  await options.resolveTimeSlot({ timeSlotId: slotA._id, setupDate: day(0) }, { now: NOW });
  settingsDoc.minLeadHours = 6;
  options.invalidateSettings();
  await assert.rejects(() => options.resolveTimeSlot({ timeSlotId: slotA._id, setupDate: day(0) }, { now: NOW }), /at least 6 hours/);
});

test("time slot capacity per date", async () => {
  stubSlots();
  DecorationBooking.countDocuments = async () => 2;
  await assert.rejects(() => options.resolveTimeSlot({ timeSlotId: slotCap._id, setupDate: day(3) }, { now: NOW }), /fully booked/);
  DecorationBooking.countDocuments = async () => 1;
  assert.ok(await options.resolveTimeSlot({ timeSlotId: slotCap._id, setupDate: day(3) }, { now: NOW }));
  // staff are never blocked by capacity
  DecorationBooking.countDocuments = async () => 9;
  assert.ok(await options.resolveTimeSlot({ timeSlotId: slotCap._id, setupDate: day(3) }, { isStaff: true, now: NOW }));
});

test("custom time: only inside the admin's window, in steps, when enabled", async () => {
  stubSlots();
  const ok = await options.resolveTimeSlot({ customTime: { startTime: "19:30" }, setupDate: day(3) }, { now: NOW });
  assert.equal(ok.isCustom, true);
  assert.equal(ok.label, "07:30 PM - 09:30 PM (Custom)"); // default 2 h duration

  const withEnd = await options.resolveTimeSlot({ customTime: { startTime: "10:00", endTime: "12:30" }, setupDate: day(3) }, { now: NOW });
  assert.equal(withEnd.label, "10:00 AM - 12:30 PM (Custom)");

  const bad = (customTime, re) => assert.rejects(() => options.resolveTimeSlot({ customTime, setupDate: day(3) }, { now: NOW }), re);
  await bad({ startTime: "06:00" }, /between 08:00 AM and 11:00 PM/); // before the window
  await bad({ startTime: "22:30" }, /between/); // 22:30 + 2 h runs past 23:00
  await bad({ startTime: "19:10" }, /30-minute steps/);
  await bad({ startTime: "19:30", endTime: "19:30" }, /at least 60 minutes/);
  await bad({ startTime: "25:00" }, /valid start time/);

  settingsDoc.allowCustomTimeSlot = false;
  options.invalidateSettings();
  await bad({ startTime: "19:30" }, /not available right now/);
  // staff may still enter one
  assert.ok(await options.resolveTimeSlot({ customTime: { startTime: "19:30" }, setupDate: day(3) }, { isStaff: true, now: NOW }));
});

test("public options: only active items, per-date availability", async () => {
  VenueType.find = () => q([{ _id: "v1", name: "Hotel Room", askHotelDetails: true, icon: "🏨" }]);
  ColorTheme.find = () => q([{ _id: "t1", name: "Red & Gold", primaryColor: "#DC2626", secondaryColor: "#F59E0B" }]);
  TimeSlot.find = () => q([slotA, slotCap]);
  DecorationBooking.aggregate = async () => [{ _id: slotCap.label, count: 2 }];

  const out = await options.getPublicOptions({ date: day(3), now: NOW });
  assert.equal(out.venueTypes[0].askHotelDetails, true);
  assert.equal(out.colorThemes[0].primaryColor, "#DC2626");
  const [a, cap] = out.timeSlots;
  assert.equal(a.available, true);
  assert.equal(cap.available, false);
  assert.equal(cap.reason, "Fully booked");
  assert.equal(cap.spotsLeft, 0);
  assert.equal(out.settings.advancePercent, 20);
  assert.equal(out.settings.supportWhatsapp, "918400787712");
  assert.equal(out.settings.allowCustomTimeSlot, true);

  // a day that has already passed → everything is unavailable
  const past = await options.getPublicOptions({ date: day(-2), now: NOW });
  assert.ok(past.timeSlots.every((s) => s.available === false && s.reason === "Past"));

  // without a date there is no availability info
  const plain = await options.getPublicOptions({});
  assert.equal(plain.timeSlots[0].available, undefined);
});

// ───────────── colour themes ─────────────
test("colour theme: package theme or an active global theme; empty is fine", async () => {
  ColorTheme.findOne = (f) => q(/rose/i.test(f.name.$regex) ? { name: "Rose Gold" } : null);
  assert.equal(await options.resolveColorTheme("", {}), "");
  assert.equal(await options.resolveColorTheme("rose gold", {}), "Rose Gold");
  assert.equal(await options.resolveColorTheme("neon green", { colorThemes: ["Neon Green"] }), "Neon Green");
  await assert.rejects(() => options.resolveColorTheme("Mystery", {}), /colour theme/i);
  assert.equal(await options.resolveColorTheme("Mystery", {}, { isStaff: true }), "Mystery");
});

// ───────────── admin validation ─────────────
test("admin input validation (slots, themes, venues)", () => {
  const { cleanSlot, cleanTheme, cleanVenue } = options.helpers;

  const slot = cleanSlot({ startTime: "16:00", endTime: "18:00", tag: " Evening <b> ", maxBookings: "3" }, false);
  assert.equal(slot.label, "04:00 PM - 06:00 PM");
  assert.equal(slot.tag, "Evening b");
  assert.equal(slot.maxBookings, 3);
  assert.throws(() => cleanSlot({ startTime: "18:00", endTime: "16:00" }, false), /after the start/);
  assert.throws(() => cleanSlot({ startTime: "16:00" }, false), /required/);
  assert.throws(() => cleanSlot({ startTime: "16:00", endTime: "18:00", maxBookings: -1 }, false), /Max bookings/);
  // editing only the end time keeps the existing start and rebuilds the label
  assert.equal(cleanSlot({ endTime: "19:00" }, true, { startTime: "16:00", endTime: "18:00" }).label, "04:00 PM - 07:00 PM");

  assert.equal(cleanTheme({ name: "Blue", primaryColor: "#2563eb" }, false).primaryColor, "#2563EB");
  assert.throws(() => cleanTheme({ name: "Blue", primaryColor: "blue" }, false), /#D82B76/);
  assert.throws(() => cleanTheme({ name: "  " }, false), /required/);

  assert.equal(cleanVenue({ name: "Villa", icon: "" }, false).icon, "📍");
  assert.equal(cleanVenue({ name: "Hotel", askHotelDetails: "true" }, false).askHotelDetails, true);
  assert.throws(() => cleanVenue({ name: "" }, false), /required/);
});

test("settings validation and merge", async () => {
  const { cleanSettings } = options.helpers;
  assert.throws(() => cleanSettings({ advancePercent: 0 }), /Advance percent/);
  assert.throws(() => cleanSettings({ minLeadHours: 999 }), /Minimum notice/);
  assert.throws(() => cleanSettings({ supportWhatsapp: "123" }), /WhatsApp/);
  assert.deepEqual(cleanSettings({ popularHotels: ["A", " a ", "B", ""] }).popularHotels, ["A", "B"]);
  assert.equal(cleanSettings({ supportWhatsapp: "+91 84007 87712" }).supportWhatsapp, "918400787712");

  await assert.rejects(() => options.updateSettings({ customSlot: { earliest: "23:00", latest: "08:00" } }), /earliest/);
  await assert.rejects(() => options.updateSettings({ customSlot: { minDurationMinutes: 180, defaultDurationMinutes: 60 } }), /Default duration/);

  const saved = await options.updateSettings({ advancePercent: 30, customSlot: { stepMinutes: 15 }, allowCustomTimeSlot: false });
  assert.equal(saved.advancePercent, 30);
  assert.equal(saved.customSlot.stepMinutes, 15);
  assert.equal(saved.customSlot.latest, "23:00"); // untouched values survive
  assert.equal(saved.allowCustomTimeSlot, false);
});

// ───────────── admin CRUD safety ─────────────
test("cannot delete or deactivate the last active venue type / time slot", async () => {
  const doc = {
    _id: "507f1f77bcf86cd799439041", isActive: true, set() {}, save: async () => {}, deleteOne: async () => {}, toObject() { return this; },
  };
  VenueType.findById = async () => doc;
  VenueType.countDocuments = async () => 0; // nobody else is active
  await assert.rejects(() => options.venueTypes.remove(doc._id), /at least one active venue type/);
  await assert.rejects(() => options.venueTypes.update(doc._id, { isActive: false }), /at least one active venue type/);

  VenueType.countDocuments = async () => 2;
  assert.ok(await options.venueTypes.remove(doc._id));
  assert.ok(await options.venueTypes.update(doc._id, { isActive: false }));

  await assert.rejects(() => options.venueTypes.remove("not-an-id"), /not found/);

  // colour themes may all be removed
  ColorTheme.findById = async () => ({ ...doc, deleteOne: async () => {} });
  ColorTheme.countDocuments = async () => 0;
  assert.ok(await options.colorThemes.remove(doc._id));
});

test("duplicates are reported clearly and order must be valid ids", async () => {
  TimeSlot.findOne = () => q({ sortOrder: 1 });
  TimeSlot.create = async () => {
    const e = new Error("dup"); e.code = 11000; throw e;
  };
  await assert.rejects(() => options.timeSlots.create({ startTime: "16:00", endTime: "18:00" }), /already exists/);
  await assert.rejects(() => options.timeSlots.reorder(["x"]), /Invalid order/);
  await assert.rejects(() => options.timeSlots.reorder([]), /Invalid order/);
  TimeSlot.bulkWrite = async (ops) => ({ n: ops.length });
  assert.deepEqual(await options.timeSlots.reorder(["507f1f77bcf86cd799439031", "507f1f77bcf86cd799439032"]), { count: 2 });
});

// ───────────── first-run starter options ─────────────
test("starter options are inserted once, then the admin owns them", async () => {
  const inserted = { v: 0, s: 0, t: 0 };
  Setting.findOne = () => q({ key: "default", seeded: false });
  let claimedOnce = false;
  Setting.findOneAndUpdate = async () => (claimedOnce ? null : ((claimedOnce = true), { key: "default" }));
  VenueType.estimatedDocumentCount = async () => 0;
  TimeSlot.estimatedDocumentCount = async () => 0;
  ColorTheme.estimatedDocumentCount = async () => 0;
  VenueType.insertMany = async (rows) => { inserted.v = rows.length; return rows; };
  TimeSlot.insertMany = async (rows) => { inserted.s = rows.length; assert.ok(rows.every((r) => /^\d\d:\d\d [AP]M - \d\d:\d\d [AP]M$/.test(r.label))); return rows; };
  ColorTheme.insertMany = async (rows) => { inserted.t = rows.length; return rows; };

  // fresh module instance so the one-time seed promise is not already used
  delete require.cache[require.resolve("../services/decoration/decorationOptionsService")];
  const fresh = require("../services/decoration/decorationOptionsService");
  await fresh.ensureSeeded();
  assert.ok(inserted.v >= 3 && inserted.s >= 4 && inserted.t >= 4);
  assert.ok(fresh.helpers.STARTER_VENUES.some((v) => v.askHotelDetails));
});

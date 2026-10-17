// PATH: backend/services/decoration/decorationOptionsService.js
//
// Everything a customer can CHOOSE on the decoration booking form lives in the database and is managed by the
// admin (Decoration Dashboard → Booking Setup):
//   • venue types   (Hotel room, Home, Cafe ...)
//   • time slots    (+ optional custom time chosen by the customer inside an admin-defined window)
//   • colour themes
//   • booking rules (notice hours, cancellation window, advance %, support numbers ...)
//
// The server is the authority: a booking is only accepted when its venue / slot / theme are valid options.

const mongoose = require("mongoose");
const VenueType = require("../../models/DecorationVenueType");
const TimeSlot = require("../../models/DecorationTimeSlot");
const ColorTheme = require("../../models/DecorationColorTheme");
const Setting = require("../../models/DecorationSetting");
const DecorationBooking = require("../../models/DecorationBooking");

const IST_OFFSET_MS = 330 * 60 * 1000;
const HHMM = /^([01]\d|2[0-3]):[0-5]\d$/;
const HEX = /^#[0-9a-fA-F]{6}$/;

class OptionError extends Error {
  constructor(message, statusCode = 400) {
    super(message);
    this.statusCode = statusCode;
  }
}

const num = (v, fallback) => (v === undefined || v === null || v === "" || Number.isNaN(Number(v)) ? fallback : Number(v));
const clean = (v, max) => String(v ?? "").replace(/[<>]/g, "").trim().slice(0, max);

const toMinutes = (hhmm) => {
  const [h, m] = String(hhmm).split(":").map(Number);
  return h * 60 + m;
};
const fmt12 = (hhmm) => {
  const [h, m] = String(hhmm).split(":").map(Number);
  const suffix = h >= 12 ? "PM" : "AM";
  const h12 = h % 12 === 0 ? 12 : h % 12;
  return `${String(h12).padStart(2, "0")}:${String(m).padStart(2, "0")} ${suffix}`;
};
const fromMinutes = (mins) => `${String(Math.floor(mins / 60)).padStart(2, "0")}:${String(mins % 60).padStart(2, "0")}`;
const slotLabel = (start, end) => `${fmt12(start)} - ${fmt12(end)}`;

// ───────────────────────── defaults & starter options ─────────────────────────
// Env values used to be the only way to tune these — they are only the STARTING values now.
const envDefaults = () => ({
  minLeadHours: num(process.env.DECORATION_MIN_LEAD_HOURS, 3),
  maxAdvanceDays: num(process.env.DECORATION_MAX_ADVANCE_DAYS, 180),
  cancelHours: num(process.env.DECORATION_CANCEL_HOURS, 24),
  unpaidExpiryMinutes: num(process.env.DECORATION_UNPAID_EXPIRY_MINUTES, 120),
  maxUnpaidPerUser: num(process.env.DECORATION_MAX_UNPAID, 3),
  supportWhatsapp: String(process.env.SUPPORT_WHATSAPP || ""),
});

const SETTINGS_DEFAULTS = {
  allowCustomTimeSlot: true,
  customSlot: { earliest: "08:00", latest: "23:00", stepMinutes: 30, defaultDurationMinutes: 120, minDurationMinutes: 60 },
  minLeadHours: 3,
  maxAdvanceDays: 180,
  cancelHours: 24,
  unpaidExpiryMinutes: 120,
  maxUnpaidPerUser: 3,
  advancePercent: 20,
  minAdvanceAmount: 299,
  advanceRoundTo: 50,
  popularHotels: [],
  supportWhatsapp: "",
  supportPhone: "",
};

const STARTER_VENUES = [
  { name: "Hotel Room", icon: "🏨", description: "Anniversary, surprise or OYO / resort room setups", askHotelDetails: true },
  { name: "Home / Flat", icon: "🏠", description: "Living room, bedroom or balcony decoration" },
  { name: "Cafe / Restaurant", icon: "🍽️", description: "Private dining table or booth setup" },
  { name: "Outdoor / Terrace", icon: "🌇", description: "Rooftop cabana or open lawn celebrations" },
];
const STARTER_SLOTS = [
  { start: "11:00", end: "13:00", tag: "Noon Entry" },
  { start: "14:00", end: "16:00", tag: "Afternoon" },
  { start: "16:00", end: "18:00", tag: "Evening Prime" },
  { start: "18:00", end: "20:00", tag: "Party Hours" },
  { start: "20:00", end: "22:00", tag: "Midnight Surprise" },
];
const STARTER_THEMES = [
  { name: "Red & Gold", primaryColor: "#DC2626", secondaryColor: "#F59E0B", description: "Romantic & anniversary special" },
  { name: "Rose Gold & White", primaryColor: "#E11D48", secondaryColor: "#FCE7F3", description: "Aesthetic chic & birthday" },
  { name: "Blue & Silver", primaryColor: "#2563EB", secondaryColor: "#E2E8F0", description: "Classy milestone celebration" },
  { name: "Black & Gold", primaryColor: "#1E293B", secondaryColor: "#FBBF24", description: "Luxury midnight vibe" },
  { name: "Pastel Pink & White", primaryColor: "#F472B6", secondaryColor: "#FFFFFF", description: "Gentle surprise aesthetic" },
];

// ───────────────────────── settings (cached) ─────────────────────────
let settingsCache = null; // { value, at }
const CACHE_MS = 15 * 1000;
let seedPromise = null;

const mergeSettings = (doc) => {
  const d = doc ? (typeof doc.toObject === "function" ? doc.toObject() : doc) : {};
  return {
    ...SETTINGS_DEFAULTS,
    ...Object.fromEntries(Object.entries(d).filter(([, v]) => v !== undefined && v !== null)),
    customSlot: { ...SETTINGS_DEFAULTS.customSlot, ...(d.customSlot || {}) },
    popularHotels: Array.isArray(d.popularHotels) ? d.popularHotels : [],
  };
};

/** Inserts the starter options ONCE (first run). After that the admin owns the data. */
function ensureSeeded() {
  if (!seedPromise) {
    seedPromise = (async () => {
      let setting = await Setting.findOne({ key: "default" });
      if (!setting) {
        try {
          setting = await Setting.create({ key: "default", ...envDefaults() });
        } catch (err) {
          if (err?.code !== 11000) throw err;
          setting = await Setting.findOne({ key: "default" });
        }
      }
      if (setting && !setting.seeded) {
        const claimed = await Setting.findOneAndUpdate({ key: "default", seeded: false }, { $set: { seeded: true } });
        if (claimed) {
          const [v, s, t] = await Promise.all([VenueType.estimatedDocumentCount(), TimeSlot.estimatedDocumentCount(), ColorTheme.estimatedDocumentCount()]);
          if (v === 0) {
            await VenueType.insertMany(STARTER_VENUES.map((x, i) => ({ ...x, sortOrder: i })), { ordered: false }).catch(() => {});
          }
          if (s === 0) {
            await TimeSlot.insertMany(
              STARTER_SLOTS.map((x, i) => ({ label: slotLabel(x.start, x.end), startTime: x.start, endTime: x.end, tag: x.tag, sortOrder: i })),
              { ordered: false }
            ).catch(() => {});
          }
          if (t === 0) {
            await ColorTheme.insertMany(STARTER_THEMES.map((x, i) => ({ ...x, sortOrder: i })), { ordered: false }).catch(() => {});
          }
        }
      }
    })().catch((err) => {
      seedPromise = null; // try again on the next call
      throw err;
    });
  }
  return seedPromise;
}

async function getSettings({ fresh = false } = {}) {
  await ensureSeeded();
  if (!fresh && settingsCache && Date.now() - settingsCache.at < CACHE_MS) return settingsCache.value;
  const doc = await Setting.findOne({ key: "default" }).lean();
  const value = mergeSettings(doc);
  settingsCache = { value, at: Date.now() };
  return value;
}

/** Synchronous read of the last known settings (or the defaults) — for pure helpers. */
const peekSettings = () => (settingsCache ? settingsCache.value : mergeSettings(null));
const invalidateSettings = () => {
  settingsCache = null;
};

/** Advance token for a package total, from the admin's rules. */
function computeAdvance(total, settings = peekSettings()) {
  const t = Math.max(0, Number(total) || 0);
  const raw = (t * settings.advancePercent) / 100;
  const rounded = Math.round(raw / settings.advanceRoundTo) * settings.advanceRoundTo;
  return Math.min(t, Math.max(settings.minAdvanceAmount, rounded));
}

// ───────────────────────── timing rules ─────────────────────────
function slotStartMinutes(label) {
  const m = /(\d{1,2}):(\d{2})\s*(AM|PM)/i.exec(String(label || ""));
  if (!m) return null;
  let h = Number(m[1]) % 12;
  if (/pm/i.test(m[3])) h += 12;
  return h * 60 + Number(m[2]);
}

/** Setup start as a real UTC timestamp (date + slot are Indian Standard Time). */
function setupStartMs(setupDate, label) {
  const m = /^(\d{4})-(\d{2})-(\d{2})$/.exec(String(setupDate || ""));
  if (!m) return null;
  const [y, mo, d] = [Number(m[1]), Number(m[2]), Number(m[3])];
  const base = Date.UTC(y, mo - 1, d);
  const check = new Date(base);
  if (check.getUTCFullYear() !== y || check.getUTCMonth() !== mo - 1 || check.getUTCDate() !== d) return null;
  const mins = slotStartMinutes(label);
  return base + (mins === null ? 9 * 60 : mins) * 60000 - IST_OFFSET_MS;
}

/** Throws a friendly error when the requested date/time can't be served. */
function assertSetupWindow(setupDate, label, now = Date.now(), settings = peekSettings()) {
  const start = setupStartMs(setupDate, label);
  if (start === null) throw new OptionError("Please choose a valid setup date.");

  const ist = new Date(now + IST_OFFSET_MS);
  const todayIst = Date.UTC(ist.getUTCFullYear(), ist.getUTCMonth(), ist.getUTCDate());
  const [y, m, d] = setupDate.split("-").map(Number);
  const dateUtc = Date.UTC(y, m - 1, d);

  if (dateUtc < todayIst) throw new OptionError("The setup date can't be in the past.");
  if ((dateUtc - todayIst) / 86400000 > settings.maxAdvanceDays) {
    throw new OptionError(`Decorations can be booked up to ${settings.maxAdvanceDays} days in advance.`);
  }
  if (slotStartMinutes(label) !== null && start < now + settings.minLeadHours * 3600000) {
    throw new OptionError(
      `Please book at least ${settings.minLeadHours} hours before the setup time. For a last-minute setup, message us on WhatsApp.`
    );
  }
}

// ───────────────────────── public options for the booking form ─────────────────────────
const isDateStr = (d) => /^\d{4}-\d{2}-\d{2}$/.test(String(d || ""));

async function bookedCountsForDate(date) {
  const rows = await DecorationBooking.aggregate([
    { $match: { setupDate: date, status: { $ne: "Cancelled" } } },
    { $group: { _id: "$setupTimeSlot", count: { $sum: 1 } } },
  ]);
  return new Map(rows.map((r) => [r._id, r.count]));
}

/**
 * Data the website and the app use to draw the booking form.
 * With ?date=YYYY-MM-DD every time slot also says whether it can still be booked on that day.
 */
async function getPublicOptions({ date, now = Date.now() } = {}) {
  const settings = await getSettings();
  const [venueTypes, slots, themes] = await Promise.all([
    VenueType.find({ isActive: true }).sort({ sortOrder: 1, createdAt: 1 }).lean(),
    TimeSlot.find({ isActive: true }).sort({ sortOrder: 1, startTime: 1 }).lean(),
    ColorTheme.find({ isActive: true }).sort({ sortOrder: 1, createdAt: 1 }).lean(),
  ]);

  let counts = null;
  const withDate = isDateStr(date);
  if (withDate) counts = await bookedCountsForDate(date);

  const timeSlots = slots.map((s) => {
    const out = {
      _id: String(s._id),
      label: s.label,
      startTime: s.startTime,
      endTime: s.endTime,
      tag: s.tag || "",
      maxBookings: s.maxBookings || 0,
    };
    if (withDate) {
      let available = true;
      let reason = "";
      try {
        assertSetupWindow(date, s.label, now, settings);
      } catch (err) {
        available = false;
        reason = /past/i.test(err.message) ? "Past" : /advance/i.test(err.message) ? "Too far ahead" : "Too soon";
      }
      const booked = counts.get(s.label) || 0;
      if (available && s.maxBookings > 0 && booked >= s.maxBookings) {
        available = false;
        reason = "Fully booked";
      }
      out.available = available;
      out.reason = reason;
      out.spotsLeft = s.maxBookings > 0 ? Math.max(0, s.maxBookings - booked) : null;
    }
    return out;
  });

  return {
    venueTypes: venueTypes.map((v) => ({
      _id: String(v._id),
      name: v.name,
      description: v.description || "",
      icon: v.icon || "📍",
      askHotelDetails: Boolean(v.askHotelDetails),
    })),
    timeSlots,
    colorThemes: themes.map((t) => ({
      _id: String(t._id),
      name: t.name,
      description: t.description || "",
      primaryColor: t.primaryColor,
      secondaryColor: t.secondaryColor,
    })),
    settings: {
      allowCustomTimeSlot: settings.allowCustomTimeSlot,
      customSlot: settings.customSlot,
      minLeadHours: settings.minLeadHours,
      maxAdvanceDays: settings.maxAdvanceDays,
      cancelHours: settings.cancelHours,
      unpaidExpiryMinutes: settings.unpaidExpiryMinutes,
      advancePercent: settings.advancePercent,
      minAdvanceAmount: settings.minAdvanceAmount,
      advanceRoundTo: settings.advanceRoundTo,
      popularHotels: settings.popularHotels,
      supportWhatsapp: settings.supportWhatsapp,
      supportPhone: settings.supportPhone,
    },
    date: withDate ? date : null,
  };
}

// ───────────────────────── resolving what the customer chose (used by bookings) ─────────────────────────
const isObjectId = (v) => mongoose.Types.ObjectId.isValid(String(v || "")) && String(v).length === 24;
const escapeRegex = (s) => String(s).replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
const ci = (name) => ({ $regex: `^${escapeRegex(name)}$`, $options: "i" });

/** Venue type must be one of the active options (staff may also type a free name). */
async function resolveVenue({ venueTypeId, venueType, hotelName, roomNumber }, { isStaff = false } = {}) {
  let doc = null;
  if (isObjectId(venueTypeId)) doc = await VenueType.findOne({ _id: venueTypeId, isActive: true }).lean();
  if (!doc && venueType) doc = await VenueType.findOne({ name: ci(clean(venueType, 60)), isActive: true }).lean();

  if (!doc) {
    if (isStaff && clean(venueType, 60)) {
      return { name: clean(venueType, 60), askHotelDetails: Boolean(clean(hotelName, 120)), hotelName: clean(hotelName, 120), roomNumber: clean(roomNumber, 30) };
    }
    throw new OptionError("Please choose where the setup should happen (the selected venue type is not available).");
  }

  if (doc.askHotelDetails) {
    const hotel = clean(hotelName, 120);
    if (hotel.length < 2) throw new OptionError("Please enter the hotel name.");
    return { name: doc.name, askHotelDetails: true, hotelName: hotel, roomNumber: clean(roomNumber, 30) };
  }
  return { name: doc.name, askHotelDetails: false, hotelName: "", roomNumber: "" };
}

/** Validates a customer-typed time against the admin's custom-time window. */
function validateCustomTime(customTime, settings) {
  const rule = settings.customSlot;
  const start = clean(customTime?.startTime, 5);
  if (!HHMM.test(start)) throw new OptionError("Please choose a valid start time.");
  const startMin = toMinutes(start);
  const earliest = toMinutes(rule.earliest);
  const latest = toMinutes(rule.latest);

  let endMin;
  if (customTime?.endTime !== undefined && customTime?.endTime !== null && customTime?.endTime !== "") {
    const end = clean(customTime.endTime, 5);
    if (!HHMM.test(end)) throw new OptionError("Please choose a valid end time.");
    endMin = toMinutes(end);
  } else {
    endMin = startMin + rule.defaultDurationMinutes;
  }

  if (startMin < earliest || endMin > latest) {
    throw new OptionError(`Custom setup time must be between ${fmt12(rule.earliest)} and ${fmt12(rule.latest)}.`);
  }
  if (endMin <= startMin || endMin - startMin < rule.minDurationMinutes) {
    throw new OptionError(`The setup window must be at least ${rule.minDurationMinutes} minutes long.`);
  }
  if (startMin % rule.stepMinutes !== 0 || endMin % rule.stepMinutes !== 0) {
    throw new OptionError(`Please pick a time in ${rule.stepMinutes}-minute steps.`);
  }
  const startTime = fromMinutes(startMin);
  const endTime = fromMinutes(endMin);
  return { startTime, endTime, label: `${slotLabel(startTime, endTime)} (Custom)` };
}

/**
 * Time slot for a booking: an active admin slot (by id, or by its label for older clients), or — when the admin
 * allows it — a custom time inside the allowed window. Also enforces the notice period and per-slot capacity.
 */
async function resolveTimeSlot({ timeSlotId, setupTimeSlot, customTime, setupDate }, { isStaff = false, now = Date.now() } = {}) {
  const settings = await getSettings();
  let result;

  if (customTime && typeof customTime === "object" && (customTime.startTime || customTime.endTime)) {
    if (!settings.allowCustomTimeSlot && !isStaff) {
      throw new OptionError("Custom setup times are not available right now. Please choose one of the listed time slots.");
    }
    const c = validateCustomTime(customTime, settings);
    result = { label: c.label, startTime: c.startTime, endTime: c.endTime, isCustom: true, slotId: null, maxBookings: 0 };
  } else {
    let slot = null;
    if (isObjectId(timeSlotId)) slot = await TimeSlot.findOne({ _id: timeSlotId, isActive: true }).lean();
    if (!slot && setupTimeSlot) slot = await TimeSlot.findOne({ label: ci(clean(setupTimeSlot, 80)), isActive: true }).lean();
    if (!slot) {
      if (isStaff && clean(setupTimeSlot, 80)) {
        result = { label: clean(setupTimeSlot, 80), startTime: "", endTime: "", isCustom: false, slotId: null, maxBookings: 0 };
      } else {
        throw new OptionError("Please choose a setup time slot (the selected one is no longer available).");
      }
    } else {
      result = { label: slot.label, startTime: slot.startTime, endTime: slot.endTime, isCustom: false, slotId: slot._id, maxBookings: slot.maxBookings || 0 };
    }
  }

  if (!isStaff) {
    assertSetupWindow(setupDate, result.label, now, settings);
    if (result.maxBookings > 0) {
      const taken = await DecorationBooking.countDocuments({ setupDate, setupTimeSlot: result.label, status: { $ne: "Cancelled" } });
      if (taken >= result.maxBookings) throw new OptionError("This time slot is fully booked for that date. Please choose another slot.");
    }
  }
  return result;
}

/** Colour theme must be a package theme or an active global theme (staff may type any). Empty is allowed. */
async function resolveColorTheme(name, pkg, { isStaff = false } = {}) {
  const wanted = clean(name, 60);
  if (!wanted) return "";
  const pkgThemes = Array.isArray(pkg?.colorThemes) ? pkg.colorThemes.map((t) => String(t).trim()) : [];
  const fromPackage = pkgThemes.find((t) => t.toLowerCase() === wanted.toLowerCase());
  if (fromPackage) return fromPackage;
  const doc = await ColorTheme.findOne({ name: ci(wanted), isActive: true }).lean();
  if (doc) return doc.name;
  if (isStaff) return wanted;
  throw new OptionError("The selected colour theme is not available. Please pick one from the list.");
}

// ───────────────────────── admin management ─────────────────────────
const toBool = (v) => v === true || v === "true" || v === 1 || v === "1";

const cleanVenue = (b, partial) => {
  const out = {};
  if (!partial || b.name !== undefined) {
    out.name = clean(b.name, 60);
    if (!out.name) throw new OptionError("Venue name is required.");
  }
  if (b.description !== undefined) out.description = clean(b.description, 140);
  if (b.icon !== undefined) out.icon = clean(b.icon, 8) || "📍";
  if (b.askHotelDetails !== undefined) out.askHotelDetails = toBool(b.askHotelDetails);
  return out;
};

const cleanSlot = (b, partial, existing) => {
  const out = {};
  const start = b.startTime !== undefined ? clean(b.startTime, 5) : existing?.startTime;
  const end = b.endTime !== undefined ? clean(b.endTime, 5) : existing?.endTime;
  if (!partial || b.startTime !== undefined || b.endTime !== undefined) {
    if (!HHMM.test(start || "") || !HHMM.test(end || "")) throw new OptionError("Start and end time are required (HH:MM).");
    if (toMinutes(end) <= toMinutes(start)) throw new OptionError("End time must be after the start time.");
    out.startTime = start;
    out.endTime = end;
    out.label = slotLabel(start, end);
  }
  if (b.tag !== undefined) out.tag = clean(b.tag, 40);
  if (b.maxBookings !== undefined) {
    const n = Math.floor(num(b.maxBookings, 0));
    if (n < 0 || n > 500) throw new OptionError("Max bookings must be between 0 (unlimited) and 500.");
    out.maxBookings = n;
  }
  return out;
};

const cleanTheme = (b, partial) => {
  const out = {};
  if (!partial || b.name !== undefined) {
    out.name = clean(b.name, 60);
    if (!out.name) throw new OptionError("Theme name is required.");
  }
  if (b.description !== undefined) out.description = clean(b.description, 100);
  for (const key of ["primaryColor", "secondaryColor"]) {
    if (b[key] !== undefined) {
      const v = clean(b[key], 7);
      if (!HEX.test(v)) throw new OptionError("Colours must look like #D82B76.");
      out[key] = v.toUpperCase();
    }
  }
  return out;
};

function makeCrud({ Model, noun, cleaner, requireOneActive }) {
  const lastActiveGuard = async (doc, willBeActive) => {
    if (!requireOneActive || !doc.isActive || willBeActive) return;
    const others = await Model.countDocuments({ _id: { $ne: doc._id }, isActive: true });
    if (others === 0) throw new OptionError(`Keep at least one active ${noun} — customers couldn't book otherwise.`);
  };
  const dupe = (err) => {
    if (err?.code === 11000) throw new OptionError(`A ${noun} with this ${noun === "time slot" ? "time" : "name"} already exists.`, 409);
    throw err;
  };

  return {
    async list() {
      await ensureSeeded();
      return Model.find().sort({ sortOrder: 1, createdAt: 1 }).lean();
    },
    async create(body) {
      await ensureSeeded();
      const data = cleaner(body || {}, false);
      if (body?.isActive !== undefined) data.isActive = toBool(body.isActive);
      const last = await Model.findOne().sort({ sortOrder: -1 }).select("sortOrder").lean();
      data.sortOrder = body?.sortOrder !== undefined ? Math.floor(num(body.sortOrder, 0)) : (last?.sortOrder ?? -1) + 1;
      try {
        return (await Model.create(data)).toObject();
      } catch (err) {
        return dupe(err);
      }
    },
    async update(id, body) {
      if (!isObjectId(id)) throw new OptionError(`${noun} not found.`, 404);
      const doc = await Model.findById(id);
      if (!doc) throw new OptionError(`${noun} not found.`, 404);
      const data = cleaner(body || {}, true, doc);
      if (body?.isActive !== undefined) {
        data.isActive = toBool(body.isActive);
        await lastActiveGuard(doc, data.isActive);
      }
      if (body?.sortOrder !== undefined) data.sortOrder = Math.floor(num(body.sortOrder, doc.sortOrder));
      doc.set(data);
      try {
        await doc.save();
      } catch (err) {
        return dupe(err);
      }
      return doc.toObject();
    },
    async remove(id) {
      if (!isObjectId(id)) throw new OptionError(`${noun} not found.`, 404);
      const doc = await Model.findById(id);
      if (!doc) throw new OptionError(`${noun} not found.`, 404);
      await lastActiveGuard(doc, false);
      await doc.deleteOne();
      return { _id: String(id) };
    },
    async reorder(ids) {
      if (!Array.isArray(ids) || ids.length === 0 || ids.length > 200 || !ids.every(isObjectId)) {
        throw new OptionError("Invalid order.");
      }
      await Model.bulkWrite(ids.map((id, i) => ({ updateOne: { filter: { _id: id }, update: { $set: { sortOrder: i } } } })));
      return { count: ids.length };
    },
  };
}

const venueTypes = makeCrud({ Model: VenueType, noun: "venue type", cleaner: cleanVenue, requireOneActive: true });
const timeSlots = makeCrud({ Model: TimeSlot, noun: "time slot", cleaner: cleanSlot, requireOneActive: true });
const colorThemes = makeCrud({ Model: ColorTheme, noun: "colour theme", cleaner: cleanTheme, requireOneActive: false });

function cleanSettings(b) {
  const out = {};
  const intIn = (key, min, max, label) => {
    if (b[key] === undefined) return;
    const n = Number(b[key]);
    if (!Number.isFinite(n) || n < min || n > max) throw new OptionError(`${label} must be between ${min} and ${max}.`);
    out[key] = Math.round(n);
  };
  if (b.allowCustomTimeSlot !== undefined) out.allowCustomTimeSlot = toBool(b.allowCustomTimeSlot);

  intIn("minLeadHours", 0, 168, "Minimum notice (hours)");
  intIn("maxAdvanceDays", 1, 730, "Booking window (days)");
  intIn("cancelHours", 0, 720, "Cancellation window (hours)");
  intIn("unpaidExpiryMinutes", 10, 2880, "Payment hold (minutes)");
  intIn("maxUnpaidPerUser", 1, 20, "Unpaid bookings per customer");
  intIn("advancePercent", 1, 100, "Advance percent");
  intIn("minAdvanceAmount", 0, 100000, "Minimum advance");
  intIn("advanceRoundTo", 1, 1000, "Round advance to");

  if (b.customSlot && typeof b.customSlot === "object") {
    const c = b.customSlot;
    const cs = {};
    for (const key of ["earliest", "latest"]) {
      if (c[key] !== undefined) {
        const v = clean(c[key], 5);
        if (!HHMM.test(v)) throw new OptionError("Custom time window must use HH:MM.");
        cs[key] = v;
      }
    }
    for (const [key, min, max, label] of [
      ["stepMinutes", 5, 120, "Time step"],
      ["defaultDurationMinutes", 15, 720, "Default duration"],
      ["minDurationMinutes", 15, 720, "Minimum duration"],
    ]) {
      if (c[key] !== undefined) {
        const n = Number(c[key]);
        if (!Number.isFinite(n) || n < min || n > max) throw new OptionError(`${label} must be between ${min} and ${max} minutes.`);
        cs[key] = Math.round(n);
      }
    }
    out.customSlot = cs;
  }

  if (b.popularHotels !== undefined) {
    if (!Array.isArray(b.popularHotels)) throw new OptionError("Popular hotels must be a list.");
    const seen = new Set();
    out.popularHotels = b.popularHotels
      .map((h) => clean(h, 80))
      .filter((h) => h && !seen.has(h.toLowerCase()) && seen.add(h.toLowerCase()))
      .slice(0, 40);
  }
  if (b.supportWhatsapp !== undefined) {
    const v = String(b.supportWhatsapp).replace(/\D/g, "");
    if (v && (v.length < 10 || v.length > 15)) throw new OptionError("WhatsApp number must be 10-15 digits with country code (e.g. 918400787712).");
    out.supportWhatsapp = v;
  }
  if (b.supportPhone !== undefined) {
    const v = String(b.supportPhone).replace(/[^\d+]/g, "");
    if (v && (v.length < 10 || v.length > 16)) throw new OptionError("Support phone must be a valid number.");
    out.supportPhone = v;
  }
  return out;
}

async function updateSettings(body) {
  await ensureSeeded();
  const data = cleanSettings(body || {});
  const current = await getSettings({ fresh: true });
  const merged = { ...current.customSlot, ...(data.customSlot || {}) };
  if (toMinutes(merged.earliest) >= toMinutes(merged.latest)) throw new OptionError("The earliest custom time must be before the latest.");
  if (merged.minDurationMinutes > merged.defaultDurationMinutes) throw new OptionError("Default duration can't be shorter than the minimum duration.");

  const $set = {};
  for (const [k, v] of Object.entries(data)) {
    if (k === "customSlot") for (const [ck, cv] of Object.entries(v)) $set[`customSlot.${ck}`] = cv;
    else $set[k] = v;
  }
  if (Object.keys($set).length) await Setting.updateOne({ key: "default" }, { $set });
  invalidateSettings();
  return getSettings({ fresh: true });
}

async function getAdminOverview() {
  const [v, s, t, settings] = await Promise.all([venueTypes.list(), timeSlots.list(), colorThemes.list(), getSettings({ fresh: true })]);
  return { venueTypes: v, timeSlots: s, colorThemes: t, settings };
}

module.exports = {
  OptionError,
  ensureSeeded,
  getSettings,
  peekSettings,
  invalidateSettings,
  computeAdvance,
  assertSetupWindow,
  setupStartMs,
  slotStartMinutes,
  getPublicOptions,
  resolveVenue,
  resolveTimeSlot,
  resolveColorTheme,
  validateCustomTime,
  venueTypes,
  timeSlots,
  colorThemes,
  updateSettings,
  getAdminOverview,
  helpers: { fmt12, slotLabel, toMinutes, cleanSlot, cleanTheme, cleanVenue, cleanSettings, STARTER_VENUES, STARTER_SLOTS, STARTER_THEMES },
};

/**
 * Delivery slot rules — pure functions, no DB access.
 *
 * Every decision about "can this slot be booked for this date right now?" is
 * made HERE, on the server, in Indian Standard Time (Asia/Kolkata, UTC+05:30,
 * no daylight saving). Websites / mobile apps never decide this from the
 * customer's phone clock — they only render what the API tells them.
 *
 * Slot fields used:
 *   startTime / endTime   "HH:mm" 24h  — the delivery window
 *   cutoffTime            "HH:mm" 24h  — last booking time (preferred format)
 *                         Legacy admin text is understood too:
 *                           "8:00 PM", "Must order before 8 PM"
 *                           "3 hours before slot" (relative to startTime)
 *   cutoffDaysBefore      0 = cutoff is on the delivery day itself,
 *                         1 = the day before, … (early_morning slots default
 *                         to 1 when the field is not set)
 *   maxOrdersPerDay       capacity per delivery date (0/empty = unlimited)
 */

const IST_OFFSET_MIN = 330;
const MONTHS = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];

const pad = (n) => String(n).padStart(2, "0");

/** Current IST date ("YYYY-MM-DD") and minutes since IST midnight. */
function getISTNow(date = new Date()) {
  const shifted = new Date(date.getTime() + IST_OFFSET_MIN * 60000);
  return {
    dateStr: `${shifted.getUTCFullYear()}-${pad(shifted.getUTCMonth() + 1)}-${pad(shifted.getUTCDate())}`,
    minutes: shifted.getUTCHours() * 60 + shifted.getUTCMinutes(),
  };
}

function isValidDateStr(value) {
  if (typeof value !== "string" || !/^\d{4}-\d{2}-\d{2}$/.test(value)) return false;
  const [y, m, d] = value.split("-").map(Number);
  const dt = new Date(Date.UTC(y, m - 1, d));
  return dt.getUTCFullYear() === y && dt.getUTCMonth() === m - 1 && dt.getUTCDate() === d;
}

function dateToDayNumber(dateStr) {
  const [y, m, d] = dateStr.split("-").map(Number);
  return Math.round(Date.UTC(y, m - 1, d) / 86400000);
}

function dayNumberToDate(n) {
  const dt = new Date(n * 86400000);
  return `${dt.getUTCFullYear()}-${pad(dt.getUTCMonth() + 1)}-${pad(dt.getUTCDate())}`;
}

function addDays(dateStr, days) {
  return dayNumberToDate(dateToDayNumber(dateStr) + days);
}

/** Absolute "IST minutes" for a date + minutes-of-day, comparable across days. */
function absMinutes(dateStr, minutes) {
  return dateToDayNumber(dateStr) * 1440 + minutes;
}

/** "HH:mm" (24h) → minutes, or null when not a valid time. */
function parseHHmm(value) {
  const m = /^\s*(\d{1,2}):(\d{2})\s*$/.exec(String(value ?? ""));
  if (!m) return null;
  const h = Number(m[1]);
  const mi = Number(m[2]);
  if (h > 23 || mi > 59) return null;
  return h * 60 + mi;
}

function format12h(minutes) {
  const h24 = Math.floor(minutes / 60) % 24;
  const m = minutes % 60;
  const ampm = h24 >= 12 ? "PM" : "AM";
  const h12 = h24 % 12 === 0 ? 12 : h24 % 12;
  return `${h12}:${pad(m)} ${ampm}`;
}

function formatDateShort(dateStr) {
  const [, m, d] = dateStr.split("-").map(Number);
  return `${d} ${MONTHS[m - 1]}`;
}

/** Window of the slot in minutes-of-day, or nulls when not configured. */
function getWindow(slot) {
  const start = parseHHmm(slot?.startTime);
  const end = parseHHmm(slot?.endTime);
  return { start, end };
}

/**
 * Understands the cutoff the way the admin typed it.
 * @returns {{kind:"clock", minutes:number}|{kind:"relative", hours:number}|null}
 */
function parseCutoff(slot) {
  const raw = String(slot?.cutoffTime ?? "").trim();
  if (!raw) return null;

  const clock = parseHHmm(raw);
  if (clock !== null) return { kind: "clock", minutes: clock };

  const ampm = /(\d{1,2})(?::(\d{2}))?\s*(am|pm)\b/i.exec(raw);
  if (ampm) {
    let h = Number(ampm[1]);
    const mi = Number(ampm[2] || 0);
    if (h >= 1 && h <= 12 && mi <= 59) {
      const isPm = ampm[3].toLowerCase() === "pm";
      h = (h % 12) + (isPm ? 12 : 0);
      return { kind: "clock", minutes: h * 60 + mi };
    }
  }

  const rel = /(\d+(?:\.\d+)?)\s*(?:hours?|hrs?|h)\b/i.exec(raw);
  if (rel) return { kind: "relative", hours: Number(rel[1]) };

  return null;
}

function getCutoffDaysBefore(slot) {
  const n = Number(slot?.cutoffDaysBefore);
  if (slot?.cutoffDaysBefore !== undefined && slot?.cutoffDaysBefore !== null && Number.isFinite(n) && n >= 0) {
    return Math.floor(n);
  }
  return slot?.type === "early_morning" ? 1 : 0;
}

/**
 * The moment (absolute IST minutes) after which booking `slot` for
 * `dateStr` is closed. null = no cutoff configured.
 */
function getCutoffAbs(slot, dateStr) {
  const cutoff = parseCutoff(slot);
  if (!cutoff) return null;
  if (cutoff.kind === "clock") {
    return absMinutes(addDays(dateStr, -getCutoffDaysBefore(slot)), cutoff.minutes);
  }
  const { start } = getWindow(slot);
  if (start === null) return null;
  return absMinutes(dateStr, start) - Math.round(cutoff.hours * 60);
}

/** Human text such as "Book by 8:00 PM today". Built on the server. */
function getCutoffText(slot, dateStr, now) {
  const cutoff = parseCutoff(slot);
  if (!cutoff) return "";
  if (cutoff.kind === "relative") {
    const h = cutoff.hours;
    return `Book at least ${h} hour${h === 1 ? "" : "s"} before the slot`;
  }
  const cutoffDate = addDays(dateStr, -getCutoffDaysBefore(slot));
  const diff = dateToDayNumber(cutoffDate) - dateToDayNumber(now.dateStr);
  const when = diff === 0 ? "today" : diff === 1 ? "tomorrow" : `on ${formatDateShort(cutoffDate)}`;
  return `Book by ${format12h(cutoff.minutes)} ${when}`;
}

/**
 * Can `slot` be booked for `dateStr` right now?
 * @param {object} slot
 * @param {string} dateStr  "YYYY-MM-DD" (delivery date)
 * @param {{dateStr:string, minutes:number}} now  from getISTNow()
 * @param {number} booked   orders already holding this slot on dateStr
 */
function evaluateSlot(slot, dateStr, now, booked = 0) {
  const nowAbs = absMinutes(now.dateStr, now.minutes);
  const max = Number(slot?.maxOrdersPerDay) > 0 ? Number(slot.maxOrdersPerDay) : 0;
  const remaining = max ? Math.max(0, max - booked) : null;
  const base = { remaining, cutoffText: getCutoffText(slot, dateStr, now) };

  if (dateToDayNumber(dateStr) < dateToDayNumber(now.dateStr)) {
    return { ...base, available: false, code: "DATE_PASSED", reason: "This date has already passed" };
  }

  const { start, end } = getWindow(slot);
  if (end !== null) {
    let endAbs = absMinutes(dateStr, end);
    if (start !== null && end < start) endAbs += 1440; // window crosses midnight
    if (nowAbs >= endAbs) {
      return { ...base, available: false, code: "SLOT_ENDED", reason: "Today's window for this slot is over" };
    }
  }

  const cutoffAbs = getCutoffAbs(slot, dateStr);
  if (cutoffAbs !== null && nowAbs >= cutoffAbs) {
    return { ...base, available: false, code: "CUTOFF_PASSED", reason: "Booking is closed for this date" };
  }

  if (max && booked >= max) {
    return { ...base, available: false, code: "SOLD_OUT", reason: "Fully booked for this date" };
  }

  return { ...base, available: true, code: null, reason: "" };
}

/** ["2026-10-03", "2026-10-04", …] for today … today+maxAdvanceDays. */
function buildDateRange(now, maxAdvanceDays) {
  const out = [];
  for (let i = 0; i <= maxAdvanceDays; i += 1) out.push(addDays(now.dateStr, i));
  return out;
}

module.exports = {
  IST_OFFSET_MIN,
  getISTNow,
  isValidDateStr,
  addDays,
  dateToDayNumber,
  absMinutes,
  parseHHmm,
  format12h,
  formatDateShort,
  parseCutoff,
  getCutoffDaysBefore,
  getCutoffAbs,
  getCutoffText,
  evaluateSlot,
  buildDateRange,
};

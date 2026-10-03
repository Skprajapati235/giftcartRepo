import api from '../api/apiClient';

/**
 * Gifting services — Delivery Slots (with date + availability), Add-ons and
 * Story Highlights. Everything comes from the backend; nothing is hardcoded.
 */

/**
 * Which delivery dates are bookable and which slots are open on `date`.
 * Cutoff / sold-out decisions are made by the SERVER in IST — the phone's
 * clock is never used. Returns null when the request fails.
 *
 * Shape: { today, serverNow, maxAdvanceDays, selectedDate,
 *          dates: [{ date, availableCount }],
 *          slots: [{ _id, name, type, timeRange, extraCharge, badge,
 *                    available, unavailableReason, cutoffText, remaining,
 *                    nextAvailableDate }] }
 */
export const fetchSlotAvailability = async (date) => {
  try {
    const res = await api.get('/delivery-slots/availability', {
      params: date ? { date } : undefined,
    });
    const data = res.data?.data;
    return data && Array.isArray(data.slots) ? data : null;
  } catch (error) {
    console.warn('fetchSlotAvailability error:', error?.message || error);
    return null;
  }
};

/** Celebration add-ons (active ones only). */
export const fetchAddons = async () => {
  try {
    const res = await api.get('/addons');
    const list = res.data?.data;
    return Array.isArray(list) ? list : [];
  } catch (error) {
    console.warn('fetchAddons error:', error?.message || error);
    return [];
  }
};

/** Instagram-style Story Highlights for the Home screen (active ones only). */
export const fetchStories = async () => {
  try {
    const res = await api.get('/stories');
    const list = res.data?.data;
    return Array.isArray(list) ? list : [];
  } catch (error) {
    console.warn('fetchStories error:', error?.message || error);
    return [];
  }
};

/* ── date helpers (no timezone conversion: dates are plain "YYYY-MM-DD") ── */

const MONTHS = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
const WEEKDAYS = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];

export const parseDateParts = (dateStr) => {
  const [y, m, d] = String(dateStr).split('-').map(Number);
  const weekday = new Date(Date.UTC(y, m - 1, d)).getUTCDay();
  return { year: y, month: m, day: d, weekdayShort: WEEKDAYS[weekday], monthShort: MONTHS[m - 1] };
};

const dayDiff = (dateStr, serverToday) => {
  const p = parseDateParts(dateStr);
  const t = parseDateParts(serverToday);
  return Math.round(
    (Date.UTC(p.year, p.month - 1, p.day) - Date.UTC(t.year, t.month - 1, t.day)) / 86400000
  );
};

/** "Today" / "Tomorrow" (relative to the SERVER's today) or "Sat, 4 Oct". */
export const formatDeliveryDate = (dateStr, serverToday) => {
  if (!dateStr) return '';
  if (serverToday) {
    const diff = dayDiff(dateStr, serverToday);
    if (diff === 0) return 'Today';
    if (diff === 1) return 'Tomorrow';
  }
  const p = parseDateParts(dateStr);
  return `${p.weekdayShort}, ${p.day} ${p.monthShort}`;
};

/** Always the calendar form: "Sat, 4 Oct 2026". */
export const formatDeliveryDateLong = (dateStr) => {
  if (!dateStr) return '';
  const p = parseDateParts(dateStr);
  return `${p.weekdayShort}, ${p.day} ${p.monthShort} ${p.year}`;
};

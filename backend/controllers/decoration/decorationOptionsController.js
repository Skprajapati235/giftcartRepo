// PATH: backend/controllers/decoration/decorationOptionsController.js
const options = require("../../services/decoration/decorationOptionsService");
const { logActivity } = require("../../utils/auditLogger");

// Every change to what customers can book is recorded in the admin audit log (who / what / when / from where).
const audit = (req, action, details, metadata = {}) =>
  logActivity({ req, action, module: "Decoration Booking Setup", details, severity: "info", metadata }).catch(() => {});

const fail = (res, err) => {
  const status = err?.statusCode || (err?.name === "ValidationError" ? 400 : 500);
  if (status === 500) console.error("[decoration-options]", err);
  res.status(status).json({ success: false, message: status === 500 ? "Something went wrong" : err.message });
};

const NOUN = { "venue-types": "Venue type", "time-slots": "Time slot", "color-themes": "Colour theme" };

const crudHandlers = (entity, kind) => ({
  list: async (req, res) => {
    try {
      res.json({ success: true, data: await entity.list() });
    } catch (e) {
      fail(res, e);
    }
  },
  create: async (req, res) => {
    try {
      const data = await entity.create(req.body);
      audit(req, `${NOUN[kind]} added`, `${data.label || data.name}`, { id: String(data._id) });
      res.status(201).json({ success: true, data });
    } catch (e) {
      fail(res, e);
    }
  },
  update: async (req, res) => {
    try {
      const data = await entity.update(req.params.id, req.body);
      audit(req, `${NOUN[kind]} updated`, `${data.label || data.name}`, { id: String(data._id), fields: Object.keys(req.body || {}) });
      res.json({ success: true, data });
    } catch (e) {
      fail(res, e);
    }
  },
  remove: async (req, res) => {
    try {
      const data = await entity.remove(req.params.id);
      audit(req, `${NOUN[kind]} deleted`, `id ${data._id}`, { id: String(data._id) });
      res.json({ success: true, data });
    } catch (e) {
      fail(res, e);
    }
  },
  reorder: async (req, res) => {
    try {
      const data = await entity.reorder(req.body?.ids);
      audit(req, `${NOUN[kind]} order changed`, `${data.count} items`);
      res.json({ success: true, data });
    } catch (e) {
      fail(res, e);
    }
  },
});

module.exports = {
  // PUBLIC: everything the booking form needs (cached for a few seconds at the edge/browser)
  getPublicOptions: async (req, res) => {
    try {
      const data = await options.getPublicOptions({ date: req.query.date });
      // the per-date availability must always be fresh; the plain lists may be cached briefly
      res.set("Cache-Control", req.query.date ? "no-store" : "public, max-age=30, stale-while-revalidate=120");
      res.json({ success: true, data });
    } catch (e) {
      fail(res, e);
    }
  },

  // ADMIN
  getAdminOverview: async (req, res) => {
    try {
      res.json({ success: true, data: await options.getAdminOverview() });
    } catch (e) {
      fail(res, e);
    }
  },
  updateSettings: async (req, res) => {
    try {
      const data = await options.updateSettings(req.body);
      audit(req, "Booking rules updated", "Decoration booking rules / support details changed", { fields: Object.keys(req.body || {}) });
      res.json({ success: true, data });
    } catch (e) {
      fail(res, e);
    }
  },
  venueTypes: crudHandlers(options.venueTypes, "venue-types"),
  timeSlots: crudHandlers(options.timeSlots, "time-slots"),
  colorThemes: crudHandlers(options.colorThemes, "color-themes"),
};

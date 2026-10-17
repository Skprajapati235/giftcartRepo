// PATH: backend/routes/decoration/decorationOptionsRoutes.js
//
// Booking options (venue types, time slots, colour themes, rules).
//   GET  /api/decoration/options            PUBLIC  — what the booking form shows (add ?date=YYYY-MM-DD for availability)
//   everything else                          STAFF   — only super admin / admin may change anything
const express = require("express");
const router = express.Router();
const adminMiddleware = require("../../middleware/adminMiddleware");
const authMiddleware = require("../../middleware/authMiddleware");
const c = require("../../controllers/decoration/decorationOptionsController");

const manage = [authMiddleware, adminMiddleware, adminMiddleware.requireRole(["super_admin", "admin"], ["/decoration-panel", "/decorations"])];

router.get("/", c.getPublicOptions);

router.get("/admin/overview", ...manage, c.getAdminOverview);
router.put("/settings", ...manage, c.updateSettings);

for (const [path, h] of [
  ["venue-types", c.venueTypes],
  ["time-slots", c.timeSlots],
  ["color-themes", c.colorThemes],
]) {
  router.get(`/${path}`, ...manage, h.list);
  router.post(`/${path}`, ...manage, h.create);
  router.post(`/${path}/reorder`, ...manage, h.reorder);
  router.put(`/${path}/:id`, ...manage, h.update);
  router.delete(`/${path}/:id`, ...manage, h.remove);
}

module.exports = router;

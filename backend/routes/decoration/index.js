const express = require("express");
const router = express.Router();

const packageRoutes = require("./decorationPackageRoutes");
const partnerRoutes = require("./decorationPartnerRoutes");
const bookingRoutes = require("./decorationBookingRoutes");
const sampleRoutes = require("./decorationSampleRoutes");
const analyticsRoutes = require("./decorationAnalyticsRoutes");
const optionsRoutes = require("./decorationOptionsRoutes");

// Mount sub-routers
router.use("/packages", packageRoutes);
router.use("/partners", partnerRoutes);
router.use("/bookings", bookingRoutes);
router.use("/samples", sampleRoutes);
router.use("/analytics", analyticsRoutes);
router.use("/options", optionsRoutes);

// Direct shortcuts for backwards compatibility
router.get("/email-action/:id/:status", (req, res, next) => {
  bookingRoutes(req, res, next);
});
router.post("/email-action/:id/:status", (req, res, next) => {
  bookingRoutes(req, res, next);
});

module.exports = router;

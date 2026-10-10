const express = require("express");
const router = express.Router();
const { decorationBookingController } = require("../../controllers/decoration");
const adminMiddleware = require("../../middleware/adminMiddleware");

// PUBLIC: Customer Booking Creation
router.post("/", (req, res) => decorationBookingController.createBooking(req, res));

// PUBLIC: Customer Live Status Tracking (so customer can check live status & feel completely satisfied)
router.get("/track/:bookingId", (req, res) => decorationBookingController.trackBooking(req, res));

// 1-Click Email Action Routes
router.get("/email-action/:id/:status", (req, res) => decorationBookingController.emailActionPreview(req, res));
router.post("/email-action/:id/:status", (req, res) => decorationBookingController.emailActionConfirm(req, res));

// ADMIN: Booking Management
router.get("/", adminMiddleware, (req, res) => decorationBookingController.getAllBookings(req, res));
router.get("/:id", adminMiddleware, (req, res) => decorationBookingController.getBookingById(req, res));
router.patch("/:id/status", adminMiddleware, (req, res) => decorationBookingController.updateBookingStatus(req, res));
router.patch("/:id/assign-decorator", adminMiddleware, (req, res) => decorationBookingController.assignDecorator(req, res));

module.exports = router;

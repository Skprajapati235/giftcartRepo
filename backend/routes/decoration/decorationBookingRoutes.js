const express = require("express");
const router = express.Router();
const { decorationBookingController: c } = require("../../controllers/decoration");
const authMiddleware = require("../../middleware/authMiddleware");
const optionalAuthMiddleware = require("../../middleware/optionalAuthMiddleware");
const adminMiddleware = require("../../middleware/adminMiddleware");

// Booking management: staff roles that work with decoration orders
const staff = [adminMiddleware, adminMiddleware.requireRole(["super_admin", "admin", "kitchen_manager", "delivery_coordinator", "support_agent"], ["/decoration-panel", "/decorations"])];
const { decorationBookingLimiter, trackingLimiter } = require("../../middleware/rateLimiters");

// ── CUSTOMER (login required) ────────────────────────────────────────────────
// Booking and paying need a logged-in account. Defined BEFORE the "/:id" admin routes below.
router.post("/", authMiddleware, decorationBookingLimiter, (req, res) => c.createBooking(req, res));
router.get("/my", authMiddleware, (req, res) => c.getMyBookings(req, res));
router.get("/my/:id", authMiddleware, (req, res) => c.getMyBooking(req, res));
router.post("/my/:id/pay", authMiddleware, decorationBookingLimiter, (req, res) => c.payForBooking(req, res));
router.post("/my/:id/cancel", authMiddleware, decorationBookingLimiter, (req, res) => c.cancelMyBooking(req, res));
router.post("/verify-payment", authMiddleware, decorationBookingLimiter, (req, res) => c.verifyPayment(req, res));
// legacy "pay first, book later" order creation — still needs a login
router.post("/create-razorpay-order", authMiddleware, decorationBookingLimiter, (req, res) => c.createRazorpayOrder(req, res));

// ── PUBLIC tracking: booking id + the phone number used while booking (owner needs no phone) ──
router.get("/track/:bookingId", optionalAuthMiddleware, trackingLimiter, (req, res) => c.trackBooking(req, res));

// ── 1-click e-mail action routes (signed links, admin e-mails only) ──────────
router.get("/email-action/:id/:status", (req, res) => c.emailActionPreview(req, res));
router.post("/email-action/:id/:status", (req, res) => c.emailActionConfirm(req, res));

// ── ADMIN: booking management ────────────────────────────────────────────────
router.get("/", ...staff, (req, res) => c.getAllBookings(req, res));
router.get("/:id", ...staff, (req, res) => c.getBookingById(req, res));
router.put("/:id", ...staff, (req, res) => c.updateBooking(req, res));
router.patch("/:id", ...staff, (req, res) => c.updateBooking(req, res));
router.patch("/:id/status", ...staff, (req, res) => c.updateBookingStatus(req, res));
router.patch("/:id/assign-decorator", ...staff, (req, res) => c.assignDecorator(req, res));
router.patch("/:id/balance-collection", ...staff, (req, res) => c.recordBalancePayment(req, res));

module.exports = router;

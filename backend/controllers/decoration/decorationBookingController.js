const { decorationBookingService } = require("../../services/decoration");
const DecorationBooking = require("../../models/DecorationBooking");
const { verifyActionToken } = require("../../utils/orderActionToken");

let logActivity;
try {
  logActivity = require("../../utils/auditLogger").logActivity;
} catch (e) {
  logActivity = async () => {};
}

const VALID_DECORATION_STATUSES = [
  "Pending",
  "Confirmed",
  "Decorator Assigned",
  "In Setup",
  "Decorated & Ready",
  "Completed",
  "Cancelled",
];

function sendDecorationActionPage(res, { title, message, ok, confirmForm }) {
  const accent = ok ? "#ec4899" : "#dc2626";
  const bg = ok ? "#fdf2f8" : "#fef2f2";
  res.status(ok ? 200 : 400).send(`<!doctype html>
<html lang="en">
  <head>
    <meta charset="utf-8"/>
    <meta name="viewport" content="width=device-width,initial-scale=1"/>
    <title>${title} • GiftCart Decorations</title>
    <style>
      body { font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; background: #0f172a; margin: 0; padding: 32px 16px; color: #f8fafc; display: flex; min-height: 90vh; align-items: center; justify-content: center; }
      .card { max-width: 520px; width: 100%; background: #1e293b; border: 1px solid #334155; border-radius: 20px; padding: 32px 28px; box-shadow: 0 20px 40px rgba(0,0,0,0.4); text-align: center; }
      .badge { display: inline-block; padding: 6px 14px; border-radius: 99px; background: ${bg}; color: ${accent}; font-weight: 800; font-size: 11px; text-transform: uppercase; letter-spacing: 1px; margin-bottom: 16px; }
      h1 { margin: 0 0 12px; font-size: 22px; font-weight: 800; color: #fff; }
      p { margin: 0 0 24px; color: #94a3b8; font-size: 14px; line-height: 1.6; }
      button { background: linear-gradient(135deg, #ec4899, #be185d); color: #fff; border: 0; padding: 14px 28px; border-radius: 12px; font-weight: 800; font-size: 15px; cursor: pointer; transition: transform 0.15s ease; box-shadow: 0 8px 20px rgba(236,72,153,0.3); }
      button:hover { transform: scale(1.02); }
      .btn-back { display: inline-block; margin-top: 18px; color: #cbd5e1; font-size: 13px; text-decoration: none; }
      .btn-back:hover { color: #fff; text-decoration: underline; }
    </style>
  </head>
  <body>
    <div class="card">
      <div class="badge">🎈 GiftCart Decoration Admin</div>
      <h1>${title}</h1>
      <p>${message}</p>
      ${confirmForm || ""}
      <div><a class="btn-back" href="/decoration-panel">← Go to Decoration Command Center</a></div>
    </div>
  </body>
</html>`);
}

/**
 * Controller for Decoration Bookings & Live Customer Tracking
 */
class DecorationBookingController {
  // POST /api/decoration/bookings (Customer & Admin creation)
  async createBooking(req, res) {
    try {
      const userContext = {
        userId: req.user?._id || req.admin?._id || null,
        req,
      };

      const savedBooking = await decorationBookingService.createBooking(req.body, userContext);
      res.status(201).json({
        success: true,
        message: "Decoration booking created successfully!",
        booking: savedBooking,
        data: savedBooking,
      });
    } catch (error) {
      console.error("Error creating decoration booking:", error);
      res.status(400).json({ success: false, message: error.message });
    }
  }

  // GET /api/decoration/bookings/track/:bookingId (PUBLIC CUSTOMER LIVE TRACKER)
  async trackBooking(req, res) {
    try {
      const { bookingId } = req.params;
      const { phone } = req.query;

      const trackData = await decorationBookingService.trackBooking(bookingId, phone);
      res.json({
        success: true,
        data: trackData,
        tracking: trackData,
      });
    } catch (error) {
      console.error("Error tracking decoration booking:", error);
      res.status(404).json({ success: false, message: error.message });
    }
  }

  // GET /api/decoration/bookings (Admin list)
  async getAllBookings(req, res) {
    try {
      const result = await decorationBookingService.getAllBookings(req.query);
      res.json({
        success: true,
        data: result.bookings,
        bookings: result.bookings,
        total: result.total,
        page: result.page,
        totalPages: result.totalPages,
        stats: result.stats,
      });
    } catch (error) {
      console.error("Error fetching bookings:", error);
      res.status(500).json({ success: false, message: error.message });
    }
  }

  // GET /api/decoration/bookings/:id (Admin / Customer detail)
  async getBookingById(req, res) {
    try {
      const booking = await decorationBookingService.getBookingById(req.params.id);
      res.json({ success: true, booking, data: booking });
    } catch (error) {
      res.status(404).json({ success: false, message: error.message });
    }
  }

  // PATCH /api/decoration/bookings/:id/status (Admin)
  async updateBookingStatus(req, res) {
    try {
      const updated = await decorationBookingService.updateBookingStatus(req.params.id, req.body);
      res.json({
        success: true,
        message: `Status updated to ${req.body.status}`,
        booking: updated,
        data: updated,
      });
    } catch (error) {
      console.error("Error updating booking status:", error);
      res.status(400).json({ success: false, message: error.message });
    }
  }

  // PATCH /api/decoration/bookings/:id/assign-decorator (Admin)
  async assignDecorator(req, res) {
    try {
      const updated = await decorationBookingService.assignDecorator(req.params.id, req.body);
      res.json({
        success: true,
        message: updated.assignedPartnerName ? `Assigned to ${updated.assignedPartnerName}` : "Decorator unassigned",
        booking: updated,
        data: updated,
      });
    } catch (error) {
      console.error("Error assigning decorator:", error);
      res.status(400).json({ success: false, message: error.message });
    }
  }

  // GET /api/decoration/email-action/:id/:status
  async emailActionPreview(req, res) {
    try {
      const { id, status } = req.params;
      const { token } = req.query;

      if (!VALID_DECORATION_STATUSES.includes(status)) {
        return sendDecorationActionPage(res, { title: "Invalid Status", message: "This status is not recognized for decorations.", ok: false });
      }
      if (!verifyActionToken(id, status, token)) {
        return sendDecorationActionPage(res, {
          title: "Security Link Invalid",
          message: "This status update link is invalid or has expired. Please manage this booking from your Decoration Admin Panel.",
          ok: false,
        });
      }

      const booking = await DecorationBooking.findById(id);
      if (!booking) {
        return sendDecorationActionPage(res, { title: "Booking Not Found", message: "This decoration booking could not be found.", ok: false });
      }

      return sendDecorationActionPage(res, {
        title: "Confirm Status Update",
        message: `Booking <strong>${booking.bookingId}</strong> for <strong>"${booking.packageTitle}"</strong> (${booking.customerName}, ₹${booking.totalAmount}) at <strong>${booking.hotelName || booking.venueAddress}</strong>.<br/><br/>Are you sure you want to change status to: <strong style="color:#ec4899;">${status}</strong>?`,
        ok: true,
        confirmForm: `
          <form method="POST" action="/api/decoration/email-action/${booking._id}/${encodeURIComponent(status)}">
            <input type="hidden" name="token" value="${token}" />
            <button type="submit">Yes, Change Status to "${status}"</button>
          </form>`,
      });
    } catch (error) {
      console.error("Decoration Email Action Preview Error:", error);
      res.status(500).send("Something went wrong processing this status link.");
    }
  }

  // POST /api/decoration/email-action/:id/:status
  async emailActionConfirm(req, res) {
    try {
      const { id, status } = req.params;
      const token = req.body?.token || req.query?.token;

      const updated = await decorationBookingService.confirmEmailStatusChange(id, status, token);

      if (logActivity) {
        await logActivity({
          req,
          action: `Decoration Status: ${status}`,
          module: "Decorations",
          details: `Booking ${updated.bookingId} marked as "${status}" via 1-click email action.`,
          severity: "info",
        });
      }

      return sendDecorationActionPage(res, {
        title: "Status Updated Successfully! 🎉",
        message: `Booking <strong>${updated.bookingId}</strong> has been updated to <strong style="color:#22c55e;">${status}</strong>.<br/><br/>You can view the full record and partner assignment in your Decoration Command Center.`,
        ok: true,
      });
    } catch (error) {
      console.error("Decoration Email Action Confirm Error:", error);
      res.status(500).send(error.message || "Failed to update booking status.");
    }
  }

  // POST /api/decoration/bookings/create-razorpay-order
  async createRazorpayOrder(req, res) {
    try {
      const result = await decorationBookingService.createRazorpayOrder(req.body);
      res.json({
        success: true,
        data: result,
        ...result,
      });
    } catch (error) {
      console.error("Error creating Razorpay order for decoration:", error);
      res.status(400).json({ success: false, message: error.message });
    }
  }

  // POST /api/decoration/bookings/verify-payment
  async verifyPayment(req, res) {
    try {
      const updated = await decorationBookingService.verifyPayment(req.body);
      res.json({
        success: true,
        message: "Payment verified successfully!",
        booking: updated,
        data: updated,
      });
    } catch (error) {
      console.error("Error verifying payment signature:", error);
      res.status(400).json({ success: false, message: error.message });
    }
  }

  // PATCH /api/decoration/bookings/:id/balance-collection (Admin / Decorator records balance received)
  async recordBalancePayment(req, res) {
    try {
      const updated = await decorationBookingService.recordBalancePayment(req.params.id, req.body);
      res.json({
        success: true,
        message: "Balance payment recorded successfully!",
        booking: updated,
        data: updated,
      });
    } catch (error) {
      console.error("Error recording balance payment:", error);
      res.status(400).json({ success: false, message: error.message });
    }
  }

  // PUT / PATCH /api/decoration/bookings/:id (Admin edit booking)
  async updateBooking(req, res) {
    try {
      const updated = await decorationBookingService.updateBooking(req.params.id, req.body);
      res.json({
        success: true,
        message: "Booking updated successfully!",
        booking: updated,
        data: updated,
      });
    } catch (error) {
      console.error("Error updating booking details:", error);
      res.status(400).json({ success: false, message: error.message });
    }
  }
}

module.exports = new DecorationBookingController();

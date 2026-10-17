// PATH: backend/controllers/razorpayWebhookController.js
//
// Razorpay → server webhook. This is the safety net for the case where the
// customer PAYS but closes the tab / loses network before the browser calls
// POST /api/order/verify. Without it that order stays "Pending" forever even
// though the money was taken.
//
// Setup: Razorpay Dashboard → Settings → Webhooks → Add
//   URL    : https://<your-backend>/api/webhook/razorpay
//   Secret : any strong string  (same value in RAZORPAY_WEBHOOK_SECRET)
//   Events : payment.captured, order.paid

const crypto = require("crypto");
const orderService = require("../services/orderService");
const decorationBookingService = require("../services/decoration/decorationBookingService");

function signatureMatches(rawBody, signature, secret) {
  if (!rawBody || !signature || !secret) return false;
  const expected = crypto.createHmac("sha256", secret).update(rawBody).digest("hex");
  const a = Buffer.from(expected);
  const b = Buffer.from(String(signature));
  return a.length === b.length && crypto.timingSafeEqual(a, b);
}

exports.handle = async (req, res) => {
  const secret = process.env.RAZORPAY_WEBHOOK_SECRET;
  if (!secret) {
    console.error("[razorpay-webhook] RAZORPAY_WEBHOOK_SECRET is not set");
    return res.status(503).json({ success: false, message: "Webhook not configured" });
  }

  // rawBody is captured in server.js (express.json verify hook)
  if (!signatureMatches(req.rawBody, req.headers["x-razorpay-signature"], secret)) {
    return res.status(400).json({ success: false, message: "Invalid signature" });
  }

  try {
    const event = req.body?.event;
    const payment = req.body?.payload?.payment?.entity;
    const razorpayOrderId = payment?.order_id || req.body?.payload?.order?.entity?.id;
    const razorpayPaymentId = payment?.id;

    if ((event === "payment.captured" || event === "order.paid") && razorpayOrderId && razorpayPaymentId) {
      const order = await orderService.markPaymentSuccess(razorpayOrderId, razorpayPaymentId);
      if (!order) {
        // Not a shop order → maybe a decoration booking payment (customer paid but closed the app before verifying)
        const booking = await decorationBookingService.markPaidByWebhook(razorpayOrderId, razorpayPaymentId, payment?.amount);
        if (!booking) console.warn(`[razorpay-webhook] no order/booking for razorpay order ${razorpayOrderId}`);
      }
    }
    // payment.failed is intentionally ignored: the customer can retry inside the
    // same Razorpay popup, so a failed attempt is not a final state.

    // Always 200 for valid signatures so Razorpay doesn't keep retrying.
    return res.json({ success: true });
  } catch (err) {
    console.error("[razorpay-webhook] processing error:", err);
    // 500 → Razorpay retries later, which is what we want for transient DB errors.
    return res.status(500).json({ success: false });
  }
};

exports.signatureMatches = signatureMatches;

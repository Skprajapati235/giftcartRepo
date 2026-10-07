const express = require("express");
const router = express.Router();
const Order = require("../models/Order");

// GET /api/webhook/meta-whatsapp
// Meta Webhook Verification: called once by Meta when you enter the Webhook URL in Meta App Dashboard
router.get("/", (req, res) => {
  const mode = req.query["hub.mode"];
  const token = req.query["hub.verify_token"];
  const challenge = req.query["hub.challenge"];

  const verifyToken = process.env.META_VERIFY_TOKEN || "giftcart_meta_webhook_verify_token";

  if (mode === "subscribe" && token === verifyToken) {
    console.log("[meta-webhook] Webhook verified successfully by Meta!");
    return res.status(200).send(challenge);
  } else {
    console.warn("[meta-webhook] Verification token mismatch:", { received: token, expected: verifyToken });
    return res.sendStatus(403);
  }
});

// POST /api/webhook/meta-whatsapp
// Meta Webhook Event Notifications: receives live delivery statuses (sent, delivered, read, failed)
router.post("/", async (req, res) => {
  try {
    const body = req.body;

    if (body.object === "whatsapp_business_account") {
      for (const entry of body.entry || []) {
        for (const change of entry.changes || []) {
          const value = change.value || {};
          const statuses = value.statuses || [];

          for (const s of statuses) {
            const wamid = s.id;
            const status = s.status; // 'sent' | 'delivered' | 'read' | 'failed'
            const recipient = s.recipient_id;
            const errors = s.errors || [];

            console.log("[meta-webhook] status update:", {
              wamid,
              status,
              recipient,
              errorCode: errors[0]?.code,
              errorTitle: errors[0]?.title,
            });

            if (wamid) {
              const updateDoc = {
                "whatsappLogs.$.status": status,
                "whatsappLogs.$.success": status !== "failed",
              };

              if (status === "failed" && errors.length > 0) {
                updateDoc["whatsappLogs.$.error"] = {
                  code: errors[0]?.code,
                  message: errors[0]?.message || errors[0]?.title || "Message failed delivery by Meta",
                };
              }

              await Order.updateOne(
                { "whatsappLogs.sid": wamid },
                { $set: updateDoc }
              );
            }
          }
        }
      }

      return res.status(200).send("EVENT_RECEIVED");
    }

    res.sendStatus(404);
  } catch (err) {
    console.warn("[meta-webhook] error processing webhook:", err?.message || err);
    res.status(200).send("EVENT_RECEIVED");
  }
});

module.exports = router;

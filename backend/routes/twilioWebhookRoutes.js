const express = require("express");
const router = express.Router();
const Order = require("../models/Order");

// POST /api/webhook/twilio/status
// Handles Twilio Status Callback for WhatsApp messages (queued -> sent -> delivered / failed / undelivered)
router.post("/status", async (req, res) => {
  try {
    const {
      MessageSid,
      MessageStatus,
      ErrorCode,
      ErrorMessage,
      To,
      From,
    } = req.body;

    console.log("[twilio-webhook] status update:", {
      sid: MessageSid,
      status: MessageStatus,
      errorCode: ErrorCode,
      to: To,
    });

    if (MessageSid) {
      const isFailed = ["failed", "undelivered"].includes(String(MessageStatus || "").toLowerCase());
      const isSuccess = ["delivered", "sent"].includes(String(MessageStatus || "").toLowerCase());

      const updateFields = {
        "whatsappLogs.$.status": MessageStatus,
        "whatsappLogs.$.success": isSuccess,
      };

      if (ErrorCode || isFailed) {
        let friendlyMessage = ErrorMessage || "";
        if (Number(ErrorCode) === 63015) {
          friendlyMessage = "Twilio Sandbox: Recipient must send 'join answer-smooth' to +1 415 523 8886 on WhatsApp (expires every 72h).";
        } else if (Number(ErrorCode) === 63016) {
          friendlyMessage = "Meta 24-hr window expired: Business-initiated messages require an approved WhatsApp template.";
        }

        updateFields["whatsappLogs.$.error"] = {
          code: ErrorCode ? Number(ErrorCode) : undefined,
          message: friendlyMessage || `Twilio message ${MessageStatus}`,
        };
      }

      await Order.updateOne(
        { "whatsappLogs.sid": MessageSid },
        { $set: updateFields }
      );
    }

    res.status(200).send("<Response></Response>");
  } catch (err) {
    console.warn("[twilio-webhook] error handling callback:", err?.message || err);
    res.status(200).send("<Response></Response>");
  }
});

module.exports = router;

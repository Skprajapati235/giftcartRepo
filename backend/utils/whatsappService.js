const twilio = require("twilio");

function isTruthyEnv(value) {
  return String(value || "").toLowerCase() === "true";
}

function normalizeToWhatsAppAddress(raw) {
  if (!raw) return null;

  const trimmed = String(raw).trim();
  if (!trimmed) return null;

  if (trimmed.startsWith("whatsapp:")) return trimmed;

  // Keep only digits and plus
  const cleaned = trimmed.replace(/[^\d+]/g, "");
  if (!cleaned) return null;

  // If it already starts with +, treat as E.164
  if (cleaned.startsWith("+")) return `whatsapp:${cleaned}`;

  // If no +, try a practical default for local numbers (common case).
  // Example: "9876543210" + WHATSAPP_DEFAULT_COUNTRY_CODE="+91" => whatsapp:+919876543210
  const country = String(process.env.WHATSAPP_DEFAULT_COUNTRY_CODE || "").trim();
  if (country && /^\+\d+$/.test(country)) {
    if (/^\d{10}$/.test(cleaned)) return `whatsapp:${country}${cleaned}`;
    if (/^0\d{10}$/.test(cleaned)) return `whatsapp:${country}${cleaned.slice(1)}`;
    if (/^91\d{10}$/.test(cleaned) && country === "+91") return `whatsapp:+${cleaned}`;
  }

  return null;
}

function getClient() {
  const accountSid = process.env.TWILIO_ACCOUNT_SID;
  const authToken = process.env.TWILIO_AUTH_TOKEN;
  if (!accountSid || !authToken) return null;
  return twilio(accountSid, authToken);
}

async function sendWhatsAppMessage({ to, body }) {
  const enabled = isTruthyEnv(process.env.WHATSAPP_ENABLED);
  const from = process.env.WHATSAPP_FROM;
  const defaultTo = process.env.WHATSAPP_DEFAULT_TO;

  const normalizedTo =
    normalizeToWhatsAppAddress(to) || normalizeToWhatsAppAddress(defaultTo);

  if (!normalizedTo) {
    console.warn("[whatsapp] No valid destination number. Skipping send.");
    return { skipped: true, reason: "no_valid_to" };
  }

  if (!enabled) {
    console.log("[whatsapp dry-run]", {
      from,
      to: normalizedTo,
      body,
    });
    return { to: normalizedTo, skipped: true, reason: "disabled" };
  }

  const client = getClient();
  if (!client) {
    console.warn("[whatsapp] Twilio client not configured. Skipping send.");
    return { to: normalizedTo, skipped: true, reason: "no_client" };
  }

  if (!from) {
    console.warn("[whatsapp] WHATSAPP_FROM missing. Skipping send.");
    return { to: normalizedTo, skipped: true, reason: "no_from" };
  }

  if (!String(from).startsWith("whatsapp:")) {
    console.warn("[whatsapp] WHATSAPP_FROM must start with whatsapp:. Skipping send.", { from });
    return { to: normalizedTo, skipped: true, reason: "invalid_from" };
  }

  try {
    const message = await client.messages.create({
      from,
      to: normalizedTo,
      body,
    });
    console.log("[whatsapp] sent", { to: normalizedTo, sid: message.sid });
    return { to: normalizedTo, success: true, sid: message.sid };
  } catch (err) {
    // Twilio errors often include: status, code, moreInfo
    console.warn("[whatsapp] send failed", {
      to: normalizedTo,
      status: err?.status,
      code: err?.code,
      message: err?.message,
      moreInfo: err?.moreInfo,
    });
    return {
      to: normalizedTo,
      success: false,
      error: {
        status: err?.status,
        code: err?.code,
        message: err?.message,
        moreInfo: err?.moreInfo,
      },
    };
  }
}

async function sendWhatsAppMessageToMany({ toList, body }) {
  const unique = Array.from(
    new Set(
      (toList || [])
        .map((t) => (t == null ? "" : String(t).trim()))
        .filter(Boolean)
    )
  );

  const results = [];
  for (const to of unique) {
    // eslint-disable-next-line no-await-in-loop
    results.push(await sendWhatsAppMessage({ to, body }));
  }
  return results;
}

function buildTrackUrl(trackingToken) {
  const base = (process.env.TRACK_BASE_URL || process.env.BASE_URL || "").replace(/\/+$/, "");
  if (!base || !trackingToken) return null;
  return `${base}/track/${trackingToken}`;
}

function mapOrderStatusToLabel(status) {
  if (status === "Pending") return "Order placed";
  if (status === "Processing") return "Order confirmed";
  if (status === "Shipped") return "Order shipped";
  if (status === "Delivered") return "Order delivered";
  if (status === "Cancelled") return "Order cancelled";
  return String(status || "Order update");
}

function formatOrderUpdateMessage({ order, statusOverride }) {
  const statusLabel = mapOrderStatusToLabel(statusOverride || order?.status);
  const orderId = order?._id ? String(order._id) : "";
  const total = order?.totalAmount != null ? `₹${order.totalAmount}` : null;
  const trackUrl = buildTrackUrl(order?.trackingToken);

  const items = Array.isArray(order?.items) ? order.items : [];
  const topItems = items.slice(0, 3);
  const remaining = Math.max(0, items.length - topItems.length);

  const lines = [];
  lines.push(`Giftcart: ${statusLabel}`);
  if (orderId) lines.push(`Order ID: ${orderId}`);
  if (topItems.length) {
    lines.push(
      `Items: ${topItems
        .map((it) => `${it?.name || "Item"} x${Number(it?.quantity || 1)}`)
        .join(", ")}${remaining ? ` (+${remaining} more)` : ""}`
    );
  }
  if (total) lines.push(`Total: ${total}`);
  if (trackUrl) lines.push(`Track your order: ${trackUrl}`);

  return lines.join("\n");
}

function formatLoginMessage({ user }) {
  const name = user?.name ? String(user.name) : "there";
  return `Giftcart: Hi ${name}, login successful.`;
}

module.exports = {
  sendWhatsAppMessage,
  sendWhatsAppMessageToMany,
  normalizeToWhatsAppAddress,
  formatOrderUpdateMessage,
  formatLoginMessage,
  buildTrackUrl,
  mapOrderStatusToLabel,
};


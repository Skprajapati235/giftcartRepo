const axios = require("axios");
const twilio = require("twilio");

function isTruthyEnv(value) {
  return String(value || "").toLowerCase() === "true";
}

function getProvider() {
  const explicit = String(process.env.WHATSAPP_PROVIDER || "").toLowerCase().trim();
  if (explicit === "meta") return "meta";
  if (explicit === "twilio") return "twilio";

  // Auto-detect: if Meta credentials exist, use Meta
  if (process.env.META_WHATSAPP_TOKEN && process.env.META_PHONE_NUMBER_ID) {
    return "meta";
  }
  // If Twilio credentials exist
  if (process.env.TWILIO_ACCOUNT_SID && process.env.TWILIO_AUTH_TOKEN) {
    return "twilio";
  }
  return "meta";
}

// ─────────────────────────────────────────────────────────────
// PHONE NUMBER NORMALIZERS
// ─────────────────────────────────────────────────────────────

// Meta expects country code + digits only, NO leading '+' and NO 'whatsapp:' prefix
// Example: "8400787712" => "918400787712"
function normalizeToMetaPhone(raw) {
  if (!raw) return null;
  const trimmed = String(raw).trim().replace(/^whatsapp:/i, "");
  if (!trimmed) return null;

  const cleaned = trimmed.replace(/\D/g, "");
  if (!cleaned) return null;

  const countryDigits = String(process.env.WHATSAPP_DEFAULT_COUNTRY_CODE || "91").replace(/\D/g, "") || "91";

  // 10-digit Indian local number => prefix 91
  if (/^\d{10}$/.test(cleaned)) {
    return `${countryDigits}${cleaned}`;
  }
  // 11-digit starting with 0 => strip 0 and prefix 91
  if (/^0\d{10}$/.test(cleaned)) {
    return `${countryDigits}${cleaned.slice(1)}`;
  }
  // 12-digit already starting with 91
  if (/^91\d{10}$/.test(cleaned)) {
    return cleaned;
  }
  // General E.164 digits without plus (11-15 digits)
  if (cleaned.length >= 10 && cleaned.length <= 15) {
    return cleaned;
  }

  return cleaned;
}

// Twilio expects 'whatsapp:+918400787712'
function normalizeToWhatsAppAddress(raw) {
  if (!raw) return null;
  const trimmed = String(raw).trim();
  if (!trimmed) return null;

  if (trimmed.startsWith("whatsapp:")) return trimmed;

  const cleaned = trimmed.replace(/[^\d+]/g, "");
  if (!cleaned) return null;

  if (cleaned.startsWith("+")) return `whatsapp:${cleaned}`;

  const country = String(process.env.WHATSAPP_DEFAULT_COUNTRY_CODE || "+91").trim();
  if (country && /^\+\d+$/.test(country)) {
    if (/^\d{10}$/.test(cleaned)) return `whatsapp:${country}${cleaned}`;
    if (/^0\d{10}$/.test(cleaned)) return `whatsapp:${country}${cleaned.slice(1)}`;
    if (/^91\d{10}$/.test(cleaned) && country === "+91") return `whatsapp:+${cleaned}`;
  }

  return null;
}

// ─────────────────────────────────────────────────────────────
// META WHATSAPP CLOUD API (Official Meta / Facebook)
// ─────────────────────────────────────────────────────────────

function buildOrderTemplate({ order, statusOverride }) {
  const customerName = order?.shippingAddress?.fullName || order?.user?.name || "Customer";
  const orderId = order?._id ? `#${String(order._id).slice(-6).toUpperCase()}` : "#ORDER";
  const statusLabel = mapOrderStatusToLabel(statusOverride || order?.status);
  const total = order?.totalAmount != null ? `₹${order.totalAmount}` : "";

  const customTemplate = process.env.META_TEMPLATE_NAME;
  if (customTemplate === "giftfestive_order_update") {
    return {
      name: "giftfestive_order_update",
      languageCode: "en_US",
      components: [
        {
          type: "body",
          parameters: [
            { type: "text", text: customerName },
            { type: "text", text: orderId },
            { type: "text", text: statusLabel },
            { type: "text", text: total || "N/A" },
          ],
        },
      ],
    };
  }

  // Pre-approved fallback utility template: jaspers_market_order_confirmation_v1
  return {
    name: "jaspers_market_order_confirmation_v1",
    languageCode: "en_US",
    components: [
      {
        type: "body",
        parameters: [
          { type: "text", text: customerName },
          { type: "text", text: orderId },
          { type: "text", text: `${statusLabel} (${total})` },
        ],
      },
    ],
  };
}

async function sendMetaWhatsAppMessage({ to, body, template, order, statusOverride, _isRetry }) {
  const token = process.env.META_WHATSAPP_TOKEN;
  const phoneId = process.env.META_PHONE_NUMBER_ID;

  const normalizedTo = normalizeToMetaPhone(to);
  if (!normalizedTo) {
    console.warn("[meta-whatsapp] No valid destination number. Skipping send.");
    return { skipped: true, reason: "no_valid_to", provider: "meta" };
  }

  if (!token || !phoneId) {
    console.warn(
      "[meta-whatsapp] Missing META_WHATSAPP_TOKEN or META_PHONE_NUMBER_ID in .env. Skipping send."
    );
    return {
      to: normalizedTo,
      skipped: true,
      reason: "meta_credentials_missing",
      provider: "meta",
      diagnostic: "Please set META_WHATSAPP_TOKEN and META_PHONE_NUMBER_ID in backend/.env",
    };
  }

  const url = `https://graph.facebook.com/v21.0/${phoneId}/messages`;

  // Payload: Template message OR rich text message
  let payload;
  if (template && template.name) {
    payload = {
      messaging_product: "whatsapp",
      recipient_type: "individual",
      to: normalizedTo,
      type: "template",
      template: {
        name: template.name,
        language: { code: template.languageCode || "en" },
        components: template.components || [],
      },
    };
  } else {
    payload = {
      messaging_product: "whatsapp",
      recipient_type: "individual",
      to: normalizedTo,
      type: "text",
      text: {
        preview_url: false,
        body: body || "",
      },
    };
  }

  try {
    const res = await axios.post(url, payload, {
      headers: {
        Authorization: `Bearer ${token}`,
        "Content-Type": "application/json",
      },
      timeout: 15000,
    });

    const wamid = res.data?.messages?.[0]?.id || null;
    console.log("[meta-whatsapp] message sent successfully", {
      to: normalizedTo,
      wamid,
    });

    return {
      to: normalizedTo,
      success: true,
      sid: wamid,
      status: "sent",
      provider: "meta",
    };
  } catch (err) {
    const metaError = err.response?.data?.error || {};
    const errorCode = metaError.code;
    const errorMessage = metaError.message || err.message;

    if (errorCode === 131047 && (!template || !template.name) && !_isRetry) {
      console.log("[meta-whatsapp] 24-hr window restriction encountered (code 131047). Auto-retrying with approved Template...");
      const fallbackTemplate = buildOrderTemplate({ order, statusOverride });
      if (fallbackTemplate) {
        return await sendMetaWhatsAppMessage({
          to,
          body,
          template: fallbackTemplate,
          order,
          statusOverride,
          _isRetry: true,
        });
      }
    }

    let diagnosticHint = "";
    if (errorCode === 131030) {
      diagnosticHint =
        "Meta Test Number Restriction: Recipient must be added in the 'To' list on the Meta WhatsApp Getting Started dashboard.";
    } else if (errorCode === 131047) {
      diagnosticHint =
        "24-Hour Window Expired: WhatsApp requires an approved Meta template for business-initiated conversations outside the 24-hr window.";
    } else if (errorCode === 190) {
      diagnosticHint =
        "Meta Access Token is invalid or expired. Please generate a fresh or permanent System User Token in Meta Business Suite.";
    }

    console.warn("[meta-whatsapp] send failed", {
      to: normalizedTo,
      code: errorCode,
      message: errorMessage,
      diagnostic: diagnosticHint || undefined,
    });

    return {
      to: normalizedTo,
      success: false,
      status: "failed",
      provider: "meta",
      error: {
        code: errorCode,
        message: errorMessage,
        diagnostic: diagnosticHint,
      },
    };
  }
}

// ─────────────────────────────────────────────────────────────
// TWILIO WHATSAPP SENDER (Secondary / Fallback)
// ─────────────────────────────────────────────────────────────

function getTwilioClient() {
  const accountSid = process.env.TWILIO_ACCOUNT_SID;
  const authToken = process.env.TWILIO_AUTH_TOKEN;
  if (!accountSid || !authToken) return null;
  return twilio(accountSid, authToken);
}

async function sendTwilioWhatsAppMessage({ to, body }) {
  const from = process.env.WHATSAPP_FROM;
  const normalizedTo = normalizeToWhatsAppAddress(to);

  if (!normalizedTo) {
    return { skipped: true, reason: "no_valid_to", provider: "twilio" };
  }

  const client = getTwilioClient();
  if (!client || !from) {
    return { skipped: true, reason: "twilio_not_configured", provider: "twilio" };
  }

  const isSandbox = String(from).includes("+14155238886");
  const baseUrl = (process.env.BASE_URL || "").replace(/\/+$/, "");
  const statusCallback =
    process.env.WHATSAPP_STATUS_CALLBACK_URL ||
    (baseUrl ? `${baseUrl}/api/webhook/twilio/status` : undefined);

  const payload = { from, to: normalizedTo, body };
  if (statusCallback) payload.statusCallback = statusCallback;

  try {
    const message = await client.messages.create(payload);
    return {
      to: normalizedTo,
      success: true,
      sid: message.sid,
      status: message.status || "queued",
      isSandbox,
      provider: "twilio",
    };
  } catch (err) {
    return {
      to: normalizedTo,
      success: false,
      status: "failed",
      provider: "twilio",
      error: {
        status: err?.status,
        code: err?.code,
        message: err?.message,
      },
    };
  }
}

// ─────────────────────────────────────────────────────────────
// MAIN UNIFIED SENDER
// ─────────────────────────────────────────────────────────────

async function sendWhatsAppMessage({ to, body, template, order, statusOverride }) {
  const enabled = isTruthyEnv(process.env.WHATSAPP_ENABLED);
  if (!enabled) {
    console.log("[whatsapp dry-run] send skipped (WHATSAPP_ENABLED is false)", { to, body });
    return { to, skipped: true, reason: "disabled" };
  }

  const provider = getProvider();

  if (provider === "meta") {
    let metaTemplate = template;
    if (!metaTemplate && process.env.META_TEMPLATE_NAME) {
      metaTemplate = buildOrderTemplate({ order, statusOverride });
    }
    return await sendMetaWhatsAppMessage({ to, body, template: metaTemplate, order, statusOverride });
  }

  return await sendTwilioWhatsAppMessage({ to, body });
}

async function sendWhatsAppMessageToMany({ toList, body, template, order, statusOverride }) {
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
    results.push(await sendWhatsAppMessage({ to, body, template, order, statusOverride }));
  }
  return results;
}

// Diagnostic: fetch live status for Twilio or Meta SID
async function fetchMessageStatus(sid) {
  if (!sid) return null;

  // If Twilio SID (starts with SM)
  if (String(sid).startsWith("SM")) {
    const client = getTwilioClient();
    if (!client) return null;
    try {
      const msg = await client.messages(sid).fetch();
      return {
        sid: msg.sid,
        status: msg.status,
        errorCode: msg.errorCode,
        errorMessage: msg.errorMessage,
        to: msg.to,
        from: msg.from,
        provider: "twilio",
      };
    } catch (err) {
      return { sid, error: err?.message || err, provider: "twilio" };
    }
  }

  // If Meta WAMID (starts with wamid.)
  return {
    sid,
    status: "submitted_to_meta",
    provider: "meta",
    notice: "Real-time delivery status is updated via /api/webhook/meta-whatsapp",
  };
}

// Diagnostic test helper: tests sending and returns immediate diagnosis
async function testWhatsAppMessage({ to, body }) {
  const provider = getProvider();
  const testBody = body || `GiftFestive: Diagnostic WhatsApp test at ${new Date().toLocaleTimeString()} 🎁`;

  const sendRes = await sendWhatsAppMessage({ to, body: testBody });

  let liveStatus = null;
  if (sendRes?.sid && provider === "twilio") {
    await new Promise((resolve) => setTimeout(resolve, 2500));
    liveStatus = await fetchMessageStatus(sendRes.sid);
  }

  return {
    provider,
    ...sendRes,
    liveStatus,
  };
}

// ─────────────────────────────────────────────────────────────
// ORDER MESSAGE BUILDERS
// ─────────────────────────────────────────────────────────────

function buildTrackUrl(trackingToken) {
  const base = (process.env.TRACK_BASE_URL || process.env.BASE_URL || "").replace(/\/+$/, "");
  if (!base || !trackingToken) return null;
  return `${base}/track/${trackingToken}`;
}

function mapOrderStatusToLabel(status) {
  const labels = {
    Received: "Order received",
    Pending: "Order pending",
    "In Kitchen": "Order is in the kitchen",
    Processing: "Order is processing",
    Packed: "Order packed",
    "Out for Delivery": "Order is out for delivery",
    Shipping: "Order is shipping",
    Shipped: "Order is shipping",
    Preparing: "Order is in the kitchen",
    OutForDelivery: "Order is out for delivery",
    Delivered: "Order delivered",
    Cancelled: "Order cancelled",
  };
  if (labels[status]) return labels[status];
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
  lines.push(`GiftFestive: ${statusLabel}`);
  if (orderId) lines.push(`Order ID: #${orderId.slice(-6).toUpperCase()}`);
  if (topItems.length) {
    lines.push(
      `Items: ${topItems
        .map((it) => `${it?.name || "Item"} x${Number(it?.quantity || 1)}`)
        .join(", ")}${remaining ? ` (+${remaining} more)` : ""}`
    );
  }
  if (total) lines.push(`Total: ${total}`);
  if (trackUrl) lines.push(`Track order: ${trackUrl}`);

  return lines.join("\n");
}

function formatLoginMessage({ user }) {
  const name = user?.name ? String(user.name) : "there";
  return `GiftFestive: Hi ${name}, login successful.`;
}

module.exports = {
  sendWhatsAppMessage,
  sendWhatsAppMessageToMany,
  normalizeToWhatsAppAddress,
  normalizeToMetaPhone,
  formatOrderUpdateMessage,
  formatLoginMessage,
  buildTrackUrl,
  mapOrderStatusToLabel,
  fetchMessageStatus,
  testWhatsAppMessage,
  getProvider,
};

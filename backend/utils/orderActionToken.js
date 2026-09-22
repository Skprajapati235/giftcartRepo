const crypto = require("crypto");

// Secret used to sign order-status action links sent in admin emails.
// Falls back to JWT_SECRET so this works even if ORDER_ACTION_SECRET isn't
// set yet, but setting a dedicated ORDER_ACTION_SECRET in .env is recommended.
function getSecret() {
    return process.env.ORDER_ACTION_SECRET || process.env.JWT_SECRET || "giftcart-order-action-secret";
}

// Deterministic token for a given order + target status. Not time-limited on
// purpose (an admin may act on an order email days later), but it's scoped
// to one exact orderId+status pair so it can't be replayed for a different order/status.
function generateActionToken(orderId, status) {
    return crypto
        .createHmac("sha256", getSecret())
        .update(`${orderId}:${status}`)
        .digest("hex");
}

function verifyActionToken(orderId, status, token) {
    if (!token || typeof token !== "string") return false;
    const expected = generateActionToken(orderId, status);
    const a = Buffer.from(expected);
    const b = Buffer.from(token);
    if (a.length !== b.length) return false;
    return crypto.timingSafeEqual(a, b);
}

module.exports = { generateActionToken, verifyActionToken };
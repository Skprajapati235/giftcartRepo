const axios = require("axios");

const BASE_URL = "https://2factor.in/API/V1";

function getApiKey() {
  const apiKey = process.env.TWO_FACTOR_API_KEY;
  if (!apiKey) {
    throw new Error(
      "Missing TWO_FACTOR_API_KEY. Set it in backend/.env to enable mobile OTP login."
    );
  }
  return apiKey;
}

// 2Factor expects the number with the country code and no leading zero /
// plus sign, e.g. 919876543210 for an Indian 10-digit number.
function toE164Local(mobileNumber) {
  const digits = String(mobileNumber || "").replace(/\D/g, "");
  if (digits.length === 10) return `91${digits}`;
  if (digits.length === 12 && digits.startsWith("91")) return digits;
  throw new Error("Invalid mobile number");
}

// Kicks off 2Factor's AUTOGEN flow: 2Factor generates the OTP, sends the
// SMS, and hands us back a sessionId we later use to verify — we never
// see or store the actual OTP value.
async function sendOtp(mobileNumber) {
  const apiKey = getApiKey();
  const phone = toE164Local(mobileNumber);

  const url = `${BASE_URL}/${apiKey}/SMS/${phone}/AUTOGEN`;
  const { data } = await axios.get(url, { timeout: 15000 });

  if (!data || data.Status !== "Success" || !data.Details) {
    throw new Error(
      (data && data.Details) || "Failed to send OTP. Please try again."
    );
  }

  return { sessionId: data.Details };
}

// Asks 2Factor to confirm whether the OTP the user typed matches the
// session we started with sendOtp. 2Factor is the source of truth here —
// we don't re-derive or compare the OTP ourselves.
async function verifyOtp(sessionId, otp) {
  const apiKey = getApiKey();
  const url = `${BASE_URL}/${apiKey}/SMS/VERIFY/${sessionId}/${otp}`;
  const { data } = await axios.get(url, { timeout: 15000 });

  return Boolean(data && data.Status === "Success");
}

module.exports = { sendOtp, verifyOtp, toE164Local };

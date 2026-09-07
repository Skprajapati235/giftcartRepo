const EMAIL_PATTERN = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

function normalizeEmail(email) {
  return String(email || "").trim().toLowerCase();
}

function validateEmail(email) {
  const normalized = normalizeEmail(email);
  if (!normalized || !EMAIL_PATTERN.test(normalized)) {
    throw new Error("Please enter a valid email address");
  }
  return normalized;
}

function validatePassword(password) {
  const value = String(password || "");
  const requirements = [
    [value.length >= 8, "Password must be at least 8 characters"],
    [/[A-Z]/.test(value), "Password must contain an uppercase letter"],
    [/[a-z]/.test(value), "Password must contain a lowercase letter"],
    [/\d/.test(value), "Password must contain a digit"],
    [/[^A-Za-z0-9\s]/.test(value), "Password must contain a special character"],
  ];

  const failedRequirement = requirements.find(([valid]) => !valid);
  if (failedRequirement) throw new Error(failedRequirement[1]);
  return value;
}

module.exports = { normalizeEmail, validateEmail, validatePassword };
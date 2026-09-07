export const isStrongPassword = (password) =>
  password.length >= 8 && /[A-Z]/.test(password) && /[a-z]/.test(password) && /\d/.test(password) && /[^A-Za-z0-9\s]/.test(password);

export const isValidEmail = (email) => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
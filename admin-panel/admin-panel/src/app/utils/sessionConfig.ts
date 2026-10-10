// Centralized Admin & Staff Session Security Configuration

/**
 * Idle Inactivity Timeout: 15 minutes (900,000 ms)
 * If an admin or staff member is idle with no mouse movement, keystrokes,
 * scrolling, or touch interactions for 15 minutes, their session automatically expires.
 */
export const INACTIVITY_TIMEOUT_MINUTES = 15;
export const INACTIVITY_TIMEOUT_MS = INACTIVITY_TIMEOUT_MINUTES * 60 * 1000;

/**
 * Warning Window: 60 seconds
 * The countdown warning dialog appears 60 seconds prior to automatic logout
 * (i.e. after 14 minutes of continuous idle inactivity).
 */
export const WARNING_WINDOW_SECONDS = 60;
export const WARNING_THRESHOLD_MS = INACTIVITY_TIMEOUT_MS - WARNING_WINDOW_SECONDS * 1000;

/**
 * Server Heartbeat Check: Every 60 seconds (1 minute)
 * Continually verifies that the admin/staff account still exists and remains active in MongoDB.
 */
export const HEARTBEAT_INTERVAL_MS = 60 * 1000;

export const INACTIVITY_EXPIRED_MESSAGE =
  `Session expired due to ${INACTIVITY_TIMEOUT_MINUTES} minutes of inactivity. Please sign in again.`;

/**
 * Utility functions for calculating and formatting elapsed time ("Kitne time ho gaye").
 * Accurately calculates elapsed time since an order or event occurred.
 */

export function getRelativeTime(dateInput: string | number | Date | undefined | null): string {
  if (!dateInput) return "—";

  const date = typeof dateInput === "number" || typeof dateInput === "string" 
    ? new Date(dateInput) 
    : dateInput;

  const timestamp = date.getTime();
  if (isNaN(timestamp)) return typeof dateInput === "string" ? dateInput : "—";

  const now = Date.now();
  const diffInMs = now - timestamp;

  // If clock skew or future by a few seconds
  if (diffInMs < 30 * 1000) {
    return "Just now";
  }

  const seconds = Math.floor(diffInMs / 1000);
  const minutes = Math.floor(seconds / 60);
  const hours = Math.floor(minutes / 60);
  const days = Math.floor(hours / 24);

  if (minutes < 1) {
    return "Just now";
  }
  if (minutes === 1) {
    return "1 min ago";
  }
  if (minutes < 60) {
    return `${minutes} mins ago`;
  }
  if (hours === 1) {
    return "1 hour ago";
  }
  if (hours < 24) {
    return `${hours} hours ago`;
  }
  if (days === 1) {
    return "Yesterday";
  }
  if (days < 7) {
    return `${days} days ago`;
  }
  if (days < 30) {
    const weeks = Math.floor(days / 7);
    return weeks === 1 ? "1 week ago" : `${weeks} weeks ago`;
  }
  if (days < 365) {
    const months = Math.floor(days / 30);
    return months === 1 ? "1 month ago" : `${months} months ago`;
  }

  const years = Math.floor(days / 365);
  return years === 1 ? "1 year ago" : `${years} years ago`;
}

/**
 * Detailed breakdown, e.g. "2 hours 15 mins ago"
 */
export function getDetailedElapsedTime(dateInput: string | number | Date | undefined | null): string {
  if (!dateInput) return "—";

  const date = typeof dateInput === "number" || typeof dateInput === "string" 
    ? new Date(dateInput) 
    : dateInput;

  const timestamp = date.getTime();
  if (isNaN(timestamp)) return typeof dateInput === "string" ? dateInput : "—";

  const now = Date.now();
  const diffInMs = now - timestamp;

  if (diffInMs < 30 * 1000) {
    return "just a few seconds ago";
  }

  const totalMinutes = Math.floor(diffInMs / (1000 * 60));
  if (totalMinutes < 1) {
    return "less than a minute ago";
  }
  if (totalMinutes === 1) {
    return "1 minute ago";
  }
  if (totalMinutes < 60) {
    return `${totalMinutes} minutes ago`;
  }

  const hours = Math.floor(totalMinutes / 60);
  const remainingMinutes = totalMinutes % 60;

  if (hours < 24) {
    if (remainingMinutes === 0) {
      return hours === 1 ? "1 hour ago" : `${hours} hours ago`;
    }
    return `${hours} hr${hours > 1 ? "s" : ""} ${remainingMinutes} min${remainingMinutes > 1 ? "s" : ""} ago`;
  }

  const days = Math.floor(hours / 24);
  const remainingHours = hours % 24;

  if (days === 1) {
    return remainingHours > 0 ? `1 day ${remainingHours} hr${remainingHours > 1 ? "s" : ""} ago` : "Yesterday";
  }

  return `${days} days ago`;
}

/**
 * Formatted date & time string: "04 Oct 2026, 04:30 PM"
 */
export function formatOrderDateTime(dateInput: string | number | Date | undefined | null): string {
  if (!dateInput) return "—";
  const date = typeof dateInput === "number" || typeof dateInput === "string" 
    ? new Date(dateInput) 
    : dateInput;
  if (isNaN(date.getTime())) return "—";

  return date.toLocaleString("en-IN", {
    day: "2-digit",
    month: "short",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
    hour12: true,
  });
}

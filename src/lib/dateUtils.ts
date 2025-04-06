// Date utility functions for handling chat timestamps and grouping

/**
 * Helper function to format a date as YYYYMMDD-HHmmss
 * @param date Date to format
 * @returns Formatted date string
 */
export function formatDateForSlug(date: Date = new Date()): string {
  const year = date.getFullYear();
  const month = (date.getMonth() + 1).toString().padStart(2, "0"); // Month is 0-indexed
  const day = date.getDate().toString().padStart(2, "0");
  const hours = date.getHours().toString().padStart(2, "0");
  const minutes = date.getMinutes().toString().padStart(2, "0");
  const seconds = date.getSeconds().toString().padStart(2, "0");

  return `${year}${month}${day}-${hours}${minutes}${seconds}`;
}

/**
 * Extracts date information from a chat slug or creates a new date string.
 * Format: YYYYMMDD-HHmmss
 * @param slug A chat slug that may contain a date string
 * @returns A properly formatted date object for display and grouping
 */
export function formatChatDate(slug: string): {
  displayDate: string;
  timestamp: string;
  dateObj: Date;
  diffDays: number;
} {
  // Extract date from slug if it exists (format: YYYYMMDD-HHmmss at the end)
  const dateMatch = slug.match(/(\d{8}-\d{6})$/);
  let dateObj: Date;
  let timestamp: string;

  if (dateMatch && dateMatch[1]) {
    // Extract parts from matched date
    const datePart = dateMatch[1].substring(0, 8); // YYYYMMDD
    const timePart = dateMatch[1].substring(9, 15); // HHmmss

    // Parse date parts
    const year = parseInt(datePart.substring(0, 4));
    const month = parseInt(datePart.substring(4, 6)) - 1; // Month is 0-indexed
    const day = parseInt(datePart.substring(6, 8));
    const hour = parseInt(timePart.substring(0, 2));
    const minute = parseInt(timePart.substring(2, 4));
    const second = parseInt(timePart.substring(4, 6));

    // Create date object
    dateObj = new Date(year, month, day, hour, minute, second);
    timestamp = dateMatch[1];
  } else {
    // Default to current date for slugs without date info
    dateObj = new Date();
    timestamp = formatDateForSlug(dateObj);
  }

  // Calculate days difference for grouping
  const now = new Date();
  const diffDays = Math.floor(
    (now.getTime() - dateObj.getTime()) / (1000 * 60 * 60 * 24)
  );

  // Format date for display
  let displayDate: string;

  if (diffDays === 0) {
    displayDate = "Today";
  } else if (diffDays === 1) {
    displayDate = "Yesterday";
  } else if (diffDays < 7) {
    displayDate = `${diffDays} days ago`;
  } else if (diffDays < 30) {
    displayDate = `${Math.floor(diffDays / 7)} weeks ago`;
  } else if (diffDays < 365) {
    displayDate = dateObj.toLocaleString("default", { month: "long" });
  } else {
    displayDate = `${dateObj.toLocaleString("default", {
      month: "short",
    })} ${dateObj.getFullYear()}`;
  }

  return { displayDate, timestamp, dateObj, diffDays };
}

/**
 * Generates a new chat slug with proper date formatting
 * @param baseSlug The base slug text without the date
 * @param date Optional date to use (defaults to current date/time)
 * @returns Complete slug with date appended in format baseSlug-YYYYMMDD-HHmmss
 */
export function generateChatSlugWithDate(
  baseSlug: string,
  date: Date = new Date()
): string {
  // Format date for slug
  const timestamp = formatDateForSlug(date);

  // Clean the base slug for URL safety
  const cleanSlug = baseSlug
    .toLowerCase()
    .replace(/[^\w\s-]/g, "") // Remove special characters
    .replace(/\s+/g, "-") // Replace spaces with hyphens
    .trim()
    .slice(0, 50); // Limit length

  return `${cleanSlug}-${timestamp}`;
}

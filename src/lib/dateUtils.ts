/**
 * Date utility functions for chat slug management
 */

/**
 * Generates a timestamp suffix for chat slugs
 * Format: YYYYMMDD-HHmmss (e.g., 20240625-143042)
 * @returns string timestamp for uniqueness in slugs
 */
export function generateSlugTimestamp(): string {
  const now = new Date();

  // Format: YYYYMMDD-HHmmss
  const year = now.getFullYear();
  const month = String(now.getMonth() + 1).padStart(2, "0");
  const day = String(now.getDate()).padStart(2, "0");
  const hours = String(now.getHours()).padStart(2, "0");
  const minutes = String(now.getMinutes()).padStart(2, "0");
  const seconds = String(now.getSeconds()).padStart(2, "0");

  return `${year}${month}${day}-${hours}${minutes}${seconds}`;
}

/**
 * Extracts date from a chat slug timestamp
 * @param slug The chat slug containing timestamp
 * @returns Date object representing when the chat was created
 */
export function getDateFromSlug(slug: string): Date {
  // Match pattern YYYYMMDD-HHmmss at the end of the slug
  const timestampMatch = slug.match(/(\d{8})-(\d{6})$/);

  if (timestampMatch && timestampMatch[1] && timestampMatch[2]) {
    // Extract YYYYMMDD and HHmmss
    const datePart = timestampMatch[1];
    const timePart = timestampMatch[2];

    // Parse components
    const year = parseInt(datePart.substring(0, 4), 10);
    const month = parseInt(datePart.substring(4, 6), 10) - 1; // JS months are 0-indexed
    const day = parseInt(datePart.substring(6, 8), 10);
    const hours = parseInt(timePart.substring(0, 2), 10);
    const minutes = parseInt(timePart.substring(2, 4), 10);
    const seconds = parseInt(timePart.substring(4, 6), 10);

    return new Date(year, month, day, hours, minutes, seconds);
  }

  // Handle legacy format (6-digit timestamp) for backward compatibility
  const legacyMatch = slug.match(/(\d{6})$/);
  if (legacyMatch && legacyMatch[1]) {
    // This handles the old format for backward compatibility
    const timestamp = parseInt(legacyMatch[1], 10);
    // Use current date as base
    const now = new Date();

    // For newer chats with timestamps > 900000, return today
    if (timestamp > 900000) {
      return new Date();
    }

    // For older chats, use the old logic
    const daysAgo = Math.floor(timestamp / 10000); // Rough estimate from old code
    const result = new Date();
    result.setDate(now.getDate() - (daysAgo % 30));
    return result;
  }

  // Default to current date if no timestamp found
  return new Date();
}

/**
 * Formats a chat timestamp for display
 * Removes the timestamp portion from the slug
 * @param slug The chat slug
 * @returns Cleaned slug without timestamp
 */
export function cleanSlugForDisplay(slug: string): string {
  // Remove both new format and old format timestamps
  return slug
    .replace(/\d{8}-\d{6}$/, "") // Remove new format YYYYMMDD-HHmmss
    .replace(/\d{6}$/, "") // Remove old format (6 digits)
    .replace(/-+$/, ""); // Remove any trailing hyphens
}

/**
 * Groups chat slugs by time periods
 * @param slugs Array of chat slugs
 * @returns Object with chat slugs grouped by time periods
 */
export function groupChatsByDate(slugs: string[]): {
  today: string[];
  yesterday: string[];
  week: string[];
  month: string[];
  older: string[];
} {
  const groups = {
    today: [] as string[],
    yesterday: [] as string[],
    week: [] as string[],
    month: [] as string[],
    older: [] as string[],
  };

  // Always keep default at top if present
  if (slugs.includes("default")) {
    groups.today.push("default");
  }

  // Group other chats
  slugs.forEach((slug) => {
    if (slug === "default") return;

    const date = getDateFromSlug(slug);
    const now = new Date();

    // Reset hours to compare just the date
    const chatDate = new Date(date);
    chatDate.setHours(0, 0, 0, 0);

    const todayDate = new Date(now);
    todayDate.setHours(0, 0, 0, 0);

    const yesterdayDate = new Date(todayDate);
    yesterdayDate.setDate(todayDate.getDate() - 1);

    const diffTime = todayDate.getTime() - chatDate.getTime();
    const diffDays = Math.floor(diffTime / (1000 * 60 * 60 * 24));

    // Check which group this belongs to
    if (chatDate.getTime() === todayDate.getTime()) {
      groups.today.push(slug);
    } else if (chatDate.getTime() === yesterdayDate.getTime()) {
      groups.yesterday.push(slug);
    } else if (diffDays < 7) {
      groups.week.push(slug);
    } else if (diffDays < 30) {
      groups.month.push(slug);
    } else {
      groups.older.push(slug);
    }
  });

  return groups;
}

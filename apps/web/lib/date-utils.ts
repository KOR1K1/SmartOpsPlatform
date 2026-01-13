/**
 * Date utilities for consistent date handling across the application
 * Uses ISO 8601 format for API communication
 * Handles timezone conversion on the frontend
 */

/**
 * Format date to ISO 8601 string
 * Ensures consistent format for API communication
 */
export function formatDateISO(date: Date | string): string {
  const dateObj = typeof date === "string" ? new Date(date) : date;
  return dateObj.toISOString();
}

/**
 * Format date for display with timezone support
 * Returns formatted string based on user's locale and timezone
 * @param dateString - ISO 8601 date string from API
 * @param options - Intl.DateTimeFormatOptions
 * @returns Formatted date string
 */
export function formatDate(
  dateString: string,
  options: Intl.DateTimeFormatOptions = {
    dateStyle: "short",
    timeStyle: "short",
  }
): string {
  if (!dateString) return "";
  
  try {
    const date = new Date(dateString);
    
    // Validate date
    if (isNaN(date.getTime())) {
      return "";
    }
    
    return new Intl.DateTimeFormat("en-US", {
      ...options,
      timeZone: Intl.DateTimeFormat().resolvedOptions().timeZone, // Use user's timezone
    }).format(date);
  } catch (error) {
    return "";
  }
}

/**
 * Format date for display (date only, no time)
 * @param dateString - ISO 8601 date string from API
 * @returns Formatted date string (e.g., "1/13/2024")
 */
export function formatDateOnly(dateString: string): string {
  return formatDate(dateString, {
    dateStyle: "short",
  });
}

/**
 * Format date with relative time (e.g., "2 hours ago", "Yesterday")
 * Falls back to formatted date if older than 7 days
 * @param dateString - ISO 8601 date string from API
 * @returns Relative time string or formatted date
 */
export function formatRelativeDate(dateString: string): string {
  if (!dateString) return "";
  
  try {
    const date = new Date(dateString);
    const now = new Date();
    const diffMs = now.getTime() - date.getTime();
    const diffSeconds = Math.floor(diffMs / 1000);
    const diffMinutes = Math.floor(diffSeconds / 60);
    const diffHours = Math.floor(diffMinutes / 60);
    const diffDays = Math.floor(diffHours / 24);

    if (diffSeconds < 60) {
      return "Just now";
    } else if (diffMinutes < 60) {
      return `${diffMinutes} minute${diffMinutes !== 1 ? "s" : ""} ago`;
    } else if (diffHours < 24) {
      return `${diffHours} hour${diffHours !== 1 ? "s" : ""} ago`;
    } else if (diffDays === 1) {
      return "Yesterday";
    } else if (diffDays < 7) {
      return `${diffDays} days ago`;
    } else {
      // For older dates, return formatted date
      return formatDate(dateString, {
        dateStyle: "short",
      });
    }
  } catch (error) {
    return "";
  }
}

/**
 * Format date with full date and time
 * @param dateString - ISO 8601 date string from API
 * @returns Formatted date and time string
 */
export function formatDateTime(dateString: string): string {
  return formatDate(dateString, {
    dateStyle: "short",
    timeStyle: "short",
  });
}

/**
 * Format date for long format (e.g., "January 13, 2024")
 * @param dateString - ISO 8601 date string from API
 * @returns Formatted date string
 */
export function formatDateLong(dateString: string): string {
  return formatDate(dateString, {
    dateStyle: "long",
  });
}

/**
 * Check if date is today
 * @param dateString - ISO 8601 date string from API
 * @returns True if date is today
 */
export function isToday(dateString: string): boolean {
  if (!dateString) return false;
  
  try {
    const date = new Date(dateString);
    const today = new Date();
    
    return (
      date.getDate() === today.getDate() &&
      date.getMonth() === today.getMonth() &&
      date.getFullYear() === today.getFullYear()
    );
  } catch (error) {
    return false;
  }
}

/**
 * Check if date is yesterday
 * @param dateString - ISO 8601 date string from API
 * @returns True if date is yesterday
 */
export function isYesterday(dateString: string): boolean {
  if (!dateString) return false;
  
  try {
    const date = new Date(dateString);
    const yesterday = new Date();
    yesterday.setDate(yesterday.getDate() - 1);
    
    return (
      date.getDate() === yesterday.getDate() &&
      date.getMonth() === yesterday.getMonth() &&
      date.getFullYear() === yesterday.getFullYear()
    );
  } catch (error) {
    return false;
  }
}

/**
 * Get date range for grouping events
 * Returns dates in user's timezone
 */
export function getDateRanges() {
  const now = new Date();
  const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
  const yesterday = new Date(today);
  yesterday.setDate(yesterday.getDate() - 1);
  const weekAgo = new Date(today);
  weekAgo.setDate(weekAgo.getDate() - 7);
  
  return { today, yesterday, weekAgo };
}

/**
 * Compare two dates (for sorting)
 * @param dateString1 - ISO 8601 date string
 * @param dateString2 - ISO 8601 date string
 * @returns Negative if date1 < date2, positive if date1 > date2, 0 if equal
 */
export function compareDates(dateString1: string, dateString2: string): number {
  const date1 = new Date(dateString1);
  const date2 = new Date(dateString2);
  return date1.getTime() - date2.getTime();
}

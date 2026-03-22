import { clsx, type ClassValue } from "clsx"
import { twMerge } from "tailwind-merge"

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

export function escapeHtml(str: string): string {
  return str
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#039;");
}

/**
 * Get the current date in Europe/Brussels timezone as an ISO string (YYYY-MM-DD).
 */
export function getBrusselsDate(): string {
  const now = new Date();
  return now.toLocaleDateString("en-CA", {
    timeZone: "Europe/Brussels",
  });
}

/**
 * Compare a YYYY-MM-DD string with today's date in Brussels.
 * Returns -1 if before today, 0 if today, 1 if after today.
 */
export function compareWithBrusselsToday(dateStr: string): number {
  const today = getBrusselsDate();
  if (dateStr < today) return -1;
  if (dateStr === today) return 0;
  return 1;
}

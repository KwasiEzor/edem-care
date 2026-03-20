import type { BusinessHoursSchedule } from "@/lib/settings";

const TIMEZONE = "Europe/Brussels";

const DAY_INDEX_TO_KEY: Record<number, keyof BusinessHoursSchedule> = {
  0: "sunday",
  1: "monday",
  2: "tuesday",
  3: "wednesday",
  4: "thursday",
  5: "friday",
  6: "saturday",
};

/**
 * Check if the current time in Brussels falls within the configured business hours.
 */
export function isWithinBusinessHours(schedule: BusinessHoursSchedule): boolean {
  const now = new Date();

  // Get Brussels day of week and time
  const parts = new Intl.DateTimeFormat("en-US", {
    timeZone: TIMEZONE,
    weekday: "short",
    hour: "2-digit",
    minute: "2-digit",
    hour12: false,
  }).formatToParts(now);

  const hourStr = parts.find((p) => p.type === "hour")?.value ?? "00";
  const minuteStr = parts.find((p) => p.type === "minute")?.value ?? "00";
  const currentTime = `${hourStr}:${minuteStr}`;

  // Get Brussels day index (0=Sunday)
  const brusselsDate = new Date(
    now.toLocaleString("en-US", { timeZone: TIMEZONE })
  );
  const dayKey = DAY_INDEX_TO_KEY[brusselsDate.getDay()];

  const dayConfig = schedule[dayKey];
  if (!dayConfig?.enabled) return false;

  return currentTime >= dayConfig.start && currentTime < dayConfig.end;
}

/**
 * Check if an incoming message contains any escalation keywords.
 */
export function containsEscalationKeyword(
  text: string,
  keywords: string[]
): boolean {
  const lower = text.toLowerCase();
  return keywords.some((kw) => lower.includes(kw.toLowerCase()));
}

/**
 * Count AI messages in a conversation's message history.
 */
export function countAIMessages(
  messages: { role: string }[]
): number {
  return messages.filter((m) => m.role === "ai").length;
}

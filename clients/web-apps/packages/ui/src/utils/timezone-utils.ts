/* eslint-disable @typescript-eslint/no-explicit-any */
import { type ISelectOption } from "@avplatform/ui/types";

/* -------------------------------------------------------
 * Type-safe access to Intl.supportedValuesOf
 * -----------------------------------------------------*/
const getSupportedTimezones = (): string[] => {
  if ("supportedValuesOf" in Intl) {
    return (Intl as any).supportedValuesOf("timeZone") as string[];
  }
  return ["UTC"];
};

/* -------------------------------------------------------
 * Normalize timezone (handles aliases like Asia/Calcutta)
 * -----------------------------------------------------*/
export const normalizeTimeZone = (tz: string): string => {
  try {
    return new Intl.DateTimeFormat("en-US", {
      timeZone: tz,
    }).resolvedOptions().timeZone;
  } catch {
    return tz;
  }
};

/* -------------------------------------------------------
 * Get GMT offset (e.g., +05:30)
 * -----------------------------------------------------*/
export const getTimeZoneOffset = (tz: string, date: Date = new Date()): string => {
  try {
    const parts = new Intl.DateTimeFormat("en-US", {
      timeZone: tz,
      timeZoneName: "shortOffset",
    }).formatToParts(date);

    const value = parts.find((p) => p.type === "timeZoneName")?.value || "";

    // value is like "GMT+5:30" → remove GMT
    return value.replace("GMT", "").trim();
  } catch {
    return "";
  }
};

/* -------------------------------------------------------
 * Timezone label (e.g., "Asia/Kolkata (GMT+5:30)"), offset taken at the given date
 * -----------------------------------------------------*/
export const formatTimeZoneLabel = (tz: string, date: Date = new Date()): string =>
  `${tz.replace(/_/g, " ")} (GMT${getTimeZoneOffset(tz, date)})`;

/* -------------------------------------------------------
 * Get all timezone options (canonical + deduped)
 * -----------------------------------------------------*/
export const getTimezoneOptions = (): ISelectOption[] => {
  const timezones = getSupportedTimezones();

  const seen = new Set<string>();

  return timezones
    .map((tz) => normalizeTimeZone(tz))
    .filter((tz) => {
      if (seen.has(tz)) return false;
      seen.add(tz);
      return true;
    })
    .map((tz) => ({ value: tz, label: formatTimeZoneLabel(tz) }))
    .sort((a, b) => a.label.localeCompare(b.label));
};

/* -------------------------------------------------------
 * Get user's timezone (normalized)
 * -----------------------------------------------------*/
export const getUserTimeZone = (): string => {
  const tz = Intl.DateTimeFormat().resolvedOptions().timeZone;
  return normalizeTimeZone(tz);
};

export const applyTimeZoneOffset = (date: Date, tz: string): Date => {
  try {
    const parts = new Intl.DateTimeFormat("en-US", {
      timeZone: tz,
      hour12: false,
      year: "numeric",
      month: "2-digit",
      day: "2-digit",
      hour: "2-digit",
      minute: "2-digit",
      second: "2-digit",
    }).formatToParts(date);

    const get = (type: string) => parts.find((p) => p.type === type)?.value || "00";

    return new Date(
      `${get("year")}-${get("month")}-${get("day")}T${get("hour")}:${get("minute")}:${get("second")}`,
    );
  } catch {
    return date;
  }
};

export const removeTimeZoneOffset = (date: Date, tz: string): Date => {
  try {
    const offset = getTimeZoneOffset(tz); // "+05:30"

    const [h, m] = offset.split(":").map(Number);

    const totalMinutes = h * 60 + (m || 0);

    return new Date(date.getTime() - totalMinutes * 60 * 1000);
  } catch {
    return date;
  }
};

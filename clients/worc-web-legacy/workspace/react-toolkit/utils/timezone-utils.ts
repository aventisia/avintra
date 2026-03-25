/* eslint-disable @typescript-eslint/no-explicit-any */
import { ISelectOption } from "@aventisia/ui/types";

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
export const getTimeZoneOffset = (tz: string): string => {
  try {
    const parts = new Intl.DateTimeFormat("en-US", {
      timeZone: tz,
      timeZoneName: "shortOffset",
    }).formatToParts(new Date());

    const value = parts.find((p) => p.type === "timeZoneName")?.value || "";

    // value is like "GMT+5:30" → remove GMT
    return value.replace("GMT", "").trim();
  } catch {
    return "";
  }
};

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
    .map((tz) => {
      const offset = getTimeZoneOffset(tz);

      return {
        value: tz,
        label: `${tz.replace(/_/g, " ")} (GMT${offset})`,
      };
    })
    .sort((a, b) => a.label.localeCompare(b.label));
};

/* -------------------------------------------------------
 * Get user's timezone (normalized)
 * -----------------------------------------------------*/
export const getUserTimeZone = (): string => {
  const tz = Intl.DateTimeFormat().resolvedOptions().timeZone;
  return normalizeTimeZone(tz);
};

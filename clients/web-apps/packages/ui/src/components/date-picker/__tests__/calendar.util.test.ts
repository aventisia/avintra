import { enUS } from "date-fns/locale";
import { describe, expect, it } from "vitest";

import { genMonths, genYears, getEndDate, getStartDate, getValidLocale, isLeftNavigationDisabled, isRightNavigationDisabled } from "../calendar.util";

describe("calendar.util", () => {
  describe("genMonths", () => {
    it("generates 12 localized months", () => {
      const months = genMonths(enUS);
      expect(months).toHaveLength(12);
      expect(months[0]).toEqual({ value: 0, label: "January" });
      expect(months[11]).toEqual({ value: 11, label: "December" });
    });
  });

  describe("genYears", () => {
    it("generates years centered on current year with default range", () => {
      const currentYear = new Date().getFullYear();
      const years = genYears();
      expect(years).toHaveLength(101);
      expect(years[0].value).toBe(currentYear - 50);
      expect(years[years.length - 1].value).toBe(currentYear + 50);
    });

    it("generates years with custom range", () => {
      const currentYear = new Date().getFullYear();
      const years = genYears(2);
      expect(years).toHaveLength(5);
      expect(years[0].value).toBe(currentYear - 2);
      expect(years[years.length - 1].value).toBe(currentYear + 2);
    });
  });

  describe("getStartDate / getEndDate", () => {
    it("returns range boundaries", () => {
      const currentYear = new Date().getFullYear();
      expect(getStartDate(2)).toEqual(new Date(currentYear - 2, 0, 1));
      expect(getEndDate(2)).toEqual(new Date(currentYear + 2, 11, 31));
    });
  });

  describe("navigation disable", () => {
    it("disables left navigation at start date", () => {
      const currentYear = new Date().getFullYear();
      expect(isLeftNavigationDisabled(new Date(currentYear - 50, 0, 1))).toBe(true);
      expect(isLeftNavigationDisabled(new Date(currentYear - 50, 1, 1))).toBe(false);
      expect(isLeftNavigationDisabled(undefined)).toBe(false);
    });

    it("disables right navigation at end date", () => {
      const currentYear = new Date().getFullYear();
      expect(isRightNavigationDisabled(new Date(currentYear + 50, 11, 1))).toBe(true);
      expect(isRightNavigationDisabled(new Date(currentYear + 50, 10, 1))).toBe(false);
      expect(isRightNavigationDisabled(undefined)).toBe(false);
    });
  });

  describe("getValidLocale", () => {
    it("returns provided locale when complete", () => {
      expect(getValidLocale(enUS).options).toBe(enUS.options);
    });

    it("falls back to enUS for incomplete locale", () => {
      expect(getValidLocale({ code: "fr" }).options).toBe(enUS.options);
    });
  });
});

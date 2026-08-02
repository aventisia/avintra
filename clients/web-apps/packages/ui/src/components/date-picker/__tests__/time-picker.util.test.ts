import { describe, expect, it } from "vitest";

import {
  convert12HourTo24Hour,
  display12HourValue,
  getArrowByType,
  getDateByType,
  getValid12Hour,
  getValidHour,
  getValidMinuteOrSecond,
  getValidNumber,
  setDateByType,
} from "../time-picker.util";

describe("time-picker.util", () => {
  describe("getValidNumber", () => {
    it("clamps values within range", () => {
      expect(getValidNumber("25", { max: 23 })).toBe("23");
      expect(getValidNumber("-1", { max: 23, min: 0 })).toBe("00");
      expect(getValidNumber("5", { max: 23 })).toBe("05");
    });

    it("loops values when enabled", () => {
      expect(getValidNumber("60", { min: 0, max: 59, loop: true })).toBe("00");
      expect(getValidNumber("-1", { min: 0, max: 59, loop: true })).toBe("59");
    });

    it("returns 00 for non-numeric input", () => {
      expect(getValidNumber("abc", { max: 23 })).toBe("00");
    });
  });

  describe("getValidHour", () => {
    it("returns valid hours", () => {
      expect(getValidHour("12")).toBe("12");
      expect(getValidHour("23")).toBe("23");
      expect(getValidHour("25")).toBe("23");
    });
  });

  describe("getValid12Hour", () => {
    it("returns valid 12-hour values", () => {
      expect(getValid12Hour("12")).toBe("12");
      expect(getValid12Hour("01")).toBe("01");
      expect(getValid12Hour("13")).toBe("12");
    });
  });

  describe("getValidMinuteOrSecond", () => {
    it("returns valid minute/second values", () => {
      expect(getValidMinuteOrSecond("59")).toBe("59");
      expect(getValidMinuteOrSecond("60")).toBe("59");
    });
  });

  describe("convert12HourTo24Hour", () => {
    it("converts AM correctly", () => {
      expect(convert12HourTo24Hour(12, "AM")).toBe(0);
      expect(convert12HourTo24Hour(1, "AM")).toBe(1);
      expect(convert12HourTo24Hour(11, "AM")).toBe(11);
    });

    it("converts PM correctly", () => {
      expect(convert12HourTo24Hour(12, "PM")).toBe(12);
      expect(convert12HourTo24Hour(1, "PM")).toBe(13);
      expect(convert12HourTo24Hour(11, "PM")).toBe(23);
    });
  });

  describe("display12HourValue", () => {
    it("displays 12-hour representation", () => {
      expect(display12HourValue(0)).toBe("12");
      expect(display12HourValue(12)).toBe("12");
      expect(display12HourValue(21)).toBe("09");
      expect(display12HourValue(22)).toBe("10");
      expect(display12HourValue(23)).toBe("11");
    });
  });

  describe("getDateByType", () => {
    it("reads time components from a date", () => {
      const date = new Date(2024, 0, 1, 13, 5, 9);
      expect(getDateByType(date, "hours")).toBe("13");
      expect(getDateByType(date, "minutes")).toBe("05");
      expect(getDateByType(date, "seconds")).toBe("09");
    });
  });

  describe("setDateByType", () => {
    it("sets time components on a date", () => {
      const date = new Date(2024, 0, 1, 0, 0, 0);
      setDateByType(date, "14", "hours");
      expect(date.getHours()).toBe(14);
      setDateByType(date, "30", "minutes");
      expect(date.getMinutes()).toBe(30);
      setDateByType(date, "45", "seconds");
      expect(date.getSeconds()).toBe(45);
    });

    it("sets 12-hour time with period", () => {
      const date = new Date(2024, 0, 1, 0, 0, 0);
      setDateByType(date, "3", "12hours", "PM");
      expect(date.getHours()).toBe(15);
    });
  });

  describe("getArrowByType", () => {
    it("steps values by type", () => {
      expect(getArrowByType("00", 1, "hours")).toBe("01");
      expect(getArrowByType("23", 1, "hours")).toBe("00");
      expect(getArrowByType("59", 1, "minutes")).toBe("00");
    });
  });
});

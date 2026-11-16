import { describe, expect, it } from "vitest";

import { formatCredits, formatCreditsExact } from "../credits-formatter";

describe("formatCredits", () => {
  it("keeps values under 10,000 whole", () => {
    expect(formatCredits(9999.456)).toBe("9,999.46");
  });

  it("compacts larger values", () => {
    expect(formatCredits(3_211_470.86)).toBe("3,211.47K");
    expect(formatCredits(32_114_708)).toBe("32.11M");
    expect(formatCredits(12_500)).toBe("12.5K");
  });

  it("compacts negative values", () => {
    expect(formatCredits(-45_000)).toBe("-45K");
  });

  it("formats the exact value", () => {
    expect(formatCreditsExact(3_211_470.864)).toBe("3,211,470.86");
  });
});

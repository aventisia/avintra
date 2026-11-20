import { describe, expect, it } from "vitest";

import { formatRunDuration } from "../format-duration.util";

describe("formatRunDuration", () => {
  it("reads what the Jobs page reads for a sub-second run", () => {
    expect(formatRunDuration("2026-10-28T10:00:00.000Z", "2026-10-28T10:00:00.680Z")).toBe("<1s");
  });

  it("keeps the compact form for whole-second runs", () => {
    expect(formatRunDuration("2026-10-28T10:00:00.000Z", "2026-10-28T10:00:02.000Z")).toBe("2s");
    expect(formatRunDuration("2026-10-28T10:00:00.000Z", "2026-10-28T10:34:38.000Z")).toBe(
      "34m 38s",
    );
  });

  it("renders an em dash when the run has no start or end time", () => {
    expect(formatRunDuration("2026-10-28T10:00:00.000Z", null)).toBe("—");
    expect(formatRunDuration(null, null)).toBe("—");
  });
});

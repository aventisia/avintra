import { describe, expect, it } from "vitest";

import { formatMessageTime } from "../message-time.util";

describe("formatMessageTime", () => {
  const now = new Date(2026, 10, 11, 18, 0);

  it("shows only the time today, the date this year, and the year before that", () => {
    expect(formatMessageTime(new Date(2026, 10, 11, 9, 5), now)).not.toMatch(/Nov/);
    expect(formatMessageTime(new Date(2026, 10, 9, 9, 5), now)).toMatch(/Nov/);
    expect(formatMessageTime(new Date(2026, 10, 9, 9, 5), now)).not.toMatch(/2026/);
    expect(formatMessageTime(new Date(2025, 0, 3, 9, 5), now)).toMatch(/2025/);
  });
});

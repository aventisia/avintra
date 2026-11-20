import { describe, expect, it } from "vitest";

import type { VoiceConversationSummary } from "../../types/voice-conversation.type";
import { toVoiceCallActivity } from "../voice-call-activity.util";

const NOW = new Date(2026, 10, 17, 12, 0);

const call = (
  id: string,
  startedAt: Date,
  outcome: VoiceConversationSummary["outcome"],
  durationMs = 0,
): VoiceConversationSummary => ({
  id,
  title: id,
  startedAt: startedAt.toISOString(),
  durationMs,
  outcome,
});

describe("toVoiceCallActivity", () => {
  it("counts calls per local day and keeps the totals inside the same window", () => {
    const activity = toVoiceCallActivity(
      [
        call("before-window", new Date(2026, 10, 14, 23, 59), "completed", 5_000),
        call("first-day", new Date(2026, 10, 15, 0, 0), "completed", 60_000),
        call("today-error", new Date(2026, 10, 17, 9, 0), "error", 30_000),
        call("today-active", new Date(2026, 10, 17, 11, 0), "active", 10_000),
        call("tomorrow", new Date(2026, 10, 18, 0, 0), "completed", 90_000),
      ],
      3,
      NOW,
    );

    expect(activity.days).toEqual([
      { date: "2026-11-15", runs: 1, succeeded: 1, failed: 0 },
      { date: "2026-11-16", runs: 0, succeeded: 0, failed: 0 },
      { date: "2026-11-17", runs: 2, succeeded: 0, failed: 1 },
    ]);
    expect(activity).toMatchObject({
      totalRuns: 3,
      succeededRuns: 1,
      failedRuns: 1,
      averageDurationSeconds: 45,
    });
  });

  it("reports no average duration when no call in the window has finished", () => {
    const activity = toVoiceCallActivity(
      [call("live", new Date(2026, 10, 17, 11, 0), "active", 10_000)],
      7,
      NOW,
    );

    expect(activity.days).toHaveLength(7);
    expect(activity.totalRuns).toBe(1);
    expect(activity.averageDurationSeconds).toBeNull();
  });
});

import { describe, expect, it } from "vitest";

import type { VoiceConversationSummary } from "../../types/voice-conversation.type";
import { groupConversationsByDay } from "../voice-conversation.util";

const call = (id: string, startedAt: string): VoiceConversationSummary => ({
  id,
  title: id,
  startedAt,
  durationMs: 0,
  outcome: "completed",
});

describe("groupConversationsByDay", () => {
  it("groups calls by local day, newest day and newest call first", () => {
    const morning = new Date(2026, 10, 17, 9, 0);
    const evening = new Date(2026, 10, 17, 18, 0);
    const yesterday = new Date(2026, 10, 16, 12, 0);

    const days = groupConversationsByDay([
      call("morning", morning.toISOString()),
      call("yesterday", yesterday.toISOString()),
      call("evening", evening.toISOString()),
    ]);

    expect(days.map((day) => day.date)).toEqual([evening.toDateString(), yesterday.toDateString()]);
    expect(days[0]).toMatchObject({ startedAt: evening.getTime() });
    expect(days[0].entries.map((entry) => entry.id)).toEqual(["evening", "morning"]);
    expect(days[1].entries.map((entry) => entry.id)).toEqual(["yesterday"]);
  });

  it("leaves out calls whose start time does not parse", () => {
    const days = groupConversationsByDay([
      call("broken", "not-a-date"),
      call("valid", new Date(2026, 10, 17, 9, 0).toISOString()),
    ]);

    expect(days).toHaveLength(1);
    expect(days[0].entries.map((entry) => entry.id)).toEqual(["valid"]);
  });
});

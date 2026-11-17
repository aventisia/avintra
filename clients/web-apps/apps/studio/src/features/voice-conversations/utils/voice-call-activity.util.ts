import { endOfDay, format, startOfDay, subDays } from "date-fns";

import type { VoiceCallActivity, VoiceConversationSummary } from "../types/voice-conversation.type";

/** Daily call counts for the last `dayCount` local days, in the run-activity shape. */
export const toVoiceCallActivity = (
  conversations: VoiceConversationSummary[],
  dayCount: number,
  now = new Date(),
): VoiceCallActivity => {
  const firstDay = startOfDay(subDays(now, dayCount - 1));
  const lastDay = endOfDay(now);
  const days = Array.from({ length: dayCount }, (_, index) => ({
    date: format(subDays(now, dayCount - 1 - index), "yyyy-MM-dd"),
    runs: 0,
    succeeded: 0,
    failed: 0,
  }));
  const dayByDate = new Map(days.map((day) => [day.date, day]));

  const inWindow = conversations.filter((conversation) => {
    const startedAt = new Date(conversation.startedAt);
    return startedAt >= firstDay && startedAt <= lastDay;
  });
  inWindow.forEach((conversation) => {
    const day = dayByDate.get(format(new Date(conversation.startedAt), "yyyy-MM-dd"));
    if (!day) return;
    day.runs += 1;
    if (conversation.outcome === "completed") day.succeeded += 1;
    if (conversation.outcome === "error") day.failed += 1;
  });

  const finished = inWindow.filter((conversation) => conversation.outcome !== "active");
  return {
    totalRuns: inWindow.length,
    succeededRuns: finished.filter((conversation) => conversation.outcome === "completed").length,
    failedRuns: finished.filter((conversation) => conversation.outcome === "error").length,
    averageDurationSeconds: finished.length
      ? finished.reduce((sum, conversation) => sum + conversation.durationMs, 0) /
        finished.length /
        1000
      : null,
    days,
  };
};

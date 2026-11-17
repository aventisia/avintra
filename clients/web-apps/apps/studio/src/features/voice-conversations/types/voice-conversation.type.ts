export type VoiceConversationOutcome = "completed" | "active" | "error";

export type VoiceConversationSummary = {
  id: string;
  title: string;
  startedAt: string;
  durationMs: number;
  outcome: VoiceConversationOutcome;
};

/** One local calendar day of calls, newest call first. */
export type VoiceConversationDay = {
  date: string;
  startedAt: number;
  entries: VoiceConversationSummary[];
};

export type VoiceCallActivityDay = {
  /** Local calendar day as `yyyy-MM-dd`. */
  date: string;
  runs: number;
  succeeded: number;
  failed: number;
};

/** Daily call counts in the shape the agent activity chart reads. */
export type VoiceCallActivity = {
  totalRuns: number;
  succeededRuns: number;
  failedRuns: number;
  averageDurationSeconds: number | null;
  days: VoiceCallActivityDay[];
};

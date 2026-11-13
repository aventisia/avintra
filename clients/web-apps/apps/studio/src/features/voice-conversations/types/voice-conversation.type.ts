export type VoiceConversationOutcome = "completed" | "active" | "error";

export type VoiceConversationSummary = {
  id: string;
  title: string;
  startedAt: string;
  durationMs: number;
  outcome: VoiceConversationOutcome;
};

import type { VoiceCaptionTurn } from "@avplatform/assistant-chat";

export type VoiceConversationChannel = "test" | "workspace";

export type VoiceConversationOutcome = "completed" | "caller-hung-up" | "error";

export type VoiceConversation = {
  id: string;
  startedAt: string;
  callerName: string;
  channel: VoiceConversationChannel;
  versionNumber: number;
  durationMs: number;
  outcome: VoiceConversationOutcome;
  errorMessage?: string;
  turns: VoiceCaptionTurn[];
};

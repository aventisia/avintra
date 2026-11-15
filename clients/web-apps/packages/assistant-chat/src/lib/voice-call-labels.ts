import type { VoiceCallState } from "../types/voice-call.type";

export const VOICE_CALL_STATE_LABELS: Record<VoiceCallState, string> = {
  idle: "Ready",
  connecting: "Connecting…",
  listening: "Listening to you…",
  thinking: "Processing…",
  speaking: "Agent speaking…",
  ended: "Call ended",
  error: "Something went wrong",
};

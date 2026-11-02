import type { VoiceCallState } from "../types/voice-call.type";

export const VOICE_CALL_STATE_LABELS: Record<VoiceCallState, string> = {
  idle: "Ready",
  connecting: "Connecting…",
  listening: "Listening…",
  thinking: "Thinking…",
  speaking: "Speaking…",
  ended: "Call ended",
  error: "Something went wrong",
};

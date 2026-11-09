import type { VoiceCallSnapshot } from "@avplatform/voice-client";

export type {
  VoiceCallSnapshot,
  VoiceCallState,
  VoiceCaptionTurn,
  VoiceSessionError,
  VoiceToolCall,
  VoiceTurnLatency,
} from "@avplatform/voice-client";

export type VoiceCallController = VoiceCallSnapshot & {
  start: () => void;
  end: () => void;
  toggleMute: () => void;
  resumeAudio: () => void;
};

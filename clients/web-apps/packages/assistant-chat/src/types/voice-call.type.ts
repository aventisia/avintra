export type VoiceCallState =
  "idle" | "connecting" | "listening" | "thinking" | "speaking" | "ended" | "error";

export type VoiceSpeaker = "caller" | "agent";

export type VoiceToolCall = {
  name: string;
  durationMs: number;
  isRunning?: boolean;
};

export type VoiceTurnLatency = {
  speechToTextMs: number;
  firstTokenMs: number;
  firstAudioMs: number;
};

export type VoiceCaptionTurn = {
  id: string;
  speaker: VoiceSpeaker;
  text: string;
  isInterim?: boolean;
  toolCalls?: VoiceToolCall[];
  latency?: VoiceTurnLatency;
};

export type VoiceCallScriptTurn = {
  speaker: VoiceSpeaker;
  text: string;
  toolCalls?: VoiceToolCall[];
  latency?: VoiceTurnLatency;
};

export type VoiceCallFrame = {
  at: number;
  state: VoiceCallState;
  turns: VoiceCaptionTurn[];
};

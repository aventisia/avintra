export type VoiceSessionMode = "test" | "live";

export type VoiceSessionRequest = {
  flowVersionId: string;
  mode: VoiceSessionMode;
};

export type VoiceSessionResponse = {
  roomName: string;
  serverUrl: string;
  clientToken: string;
  expiresIn: number;
  conversationId: string;
  agentName: string;
  mode: VoiceSessionMode;
};

export type VoiceCallState =
  "idle" | "connecting" | "listening" | "thinking" | "speaking" | "ended" | "error";

export type VoiceToolCall = { name: string; durationMs?: number; isRunning?: boolean };

export type VoiceTurnLatency = {
  speechToTextMs: number;
  firstTokenMs: number;
  firstAudioMs: number;
};

export type VoiceCaptionTurn = {
  id: string;
  speaker: "caller" | "agent";
  text: string;
  isInterim?: boolean;
  toolCalls?: VoiceToolCall[];
  latency?: VoiceTurnLatency;
};

export type VoiceSessionError = { code: string; message: string; retryable: boolean };

export type VoiceCallSnapshot = {
  state: VoiceCallState;
  isActive: boolean;
  turns: VoiceCaptionTurn[];
  callMs: number;
  isMuted: boolean;
  error: VoiceSessionError | null;
  conversationId: string | null;
  needsAudioResume: boolean;
};

/** One turn's latency as published by the worker's `voice_turn_timing` payload. */
export type VoiceTurnTiming = {
  sttMs: number | null;
  llmFirstTokenMs: number | null;
  ttsFirstAudioMs: number | null;
  turnTotalMs: number | null;
};

/** Decoded event from the worker's `avintra.voice` data topic. */
export type VoiceServerEvent =
  | {
      type: "session.state";
      conversationId: string;
      state: string;
      previousState?: string;
    }
  | {
      type: "transcript.final";
      conversationId: string;
      role: "user" | "assistant";
      text: string;
      turnId?: number;
    }
  | {
      type: "tool.call";
      conversationId: string;
      tool: unknown;
      turnId?: number;
    }
  | {
      type: "timing";
      conversationId: string;
      stage: "session" | "turn";
      durationMs?: number;
      turnId?: number;
      interrupted?: boolean;
      voiceTurnTiming?: VoiceTurnTiming;
    }
  | {
      type: "error";
      conversationId: string;
      code: string;
      message: string;
      retryable?: boolean;
      turnId?: number;
    }
  | {
      type: "session.closed";
      conversationId: string;
      code?: number;
      reason?: string;
    };

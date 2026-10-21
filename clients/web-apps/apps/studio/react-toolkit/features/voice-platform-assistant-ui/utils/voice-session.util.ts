import type { STTRequestDto } from "@/features/dynamic-config-panel/dtos/stt-model-dto";
import type { ModelConfigType } from "@/types/model-config-type";
import type { NodeInputType } from "@/types/node-data-type";

export type VoiceEngine = "pipeline" | "realtime";

export type VoiceSessionState =
  "idle" | "connecting" | "listening" | "processing" | "speaking" | "reconnecting";

export type VoiceSessionErrorKind =
  "mic-denied" | "unsupported" | "stt" | "network" | "llm" | "realtime-blocking" | "offline";

export type VoiceSessionError = {
  kind: VoiceSessionErrorKind;
  message: string;
};

/** Default hands-free listening thresholds used by the browser voice activity detector. */
export const VOICE_VAD_DEFAULTS = {
  thresholdDb: -45,
  onsetMs: 200,
  silenceMs: 800,
  hangoverMs: 600,
  minUtteranceMs: 300,
  maxUtteranceMs: 60_000,
  preRollMs: 500,
} as const;

export const VOICE_SESSION_STATE_LABEL: Record<VoiceSessionState, string> = {
  idle: "Idle",
  connecting: "Connecting",
  listening: "Connected",
  processing: "Connected",
  speaking: "Connected",
  reconnecting: "Reconnecting",
};

export const VOICE_ENGINE_LABEL: Record<VoiceEngine, string> = {
  pipeline: "Pipeline",
  realtime: "Realtime",
};

const ENGINE_MODE_INPUT_KEY = "__EngineMode__Voice";

/** Reads the configured voice engine from the agent inputs; anything but realtime uses Pipeline. */
export const resolveVoiceEngine = (inputs: NodeInputType[]): VoiceEngine => {
  const value = inputs.find((input) => input.key === ENGINE_MODE_INPUT_KEY)?.value;

  return typeof value === "string" && value.trim().toLowerCase() === "realtime"
    ? "realtime"
    : "pipeline";
};

/** Maps a microphone failure to a session error with recovery copy. */
export const resolveMicrophoneError = (
  error: unknown,
): { kind: VoiceSessionErrorKind; message: string } => {
  const name =
    typeof error === "object" && error !== null ? (error as { name?: string }).name : undefined;
  const isPermissionDenied =
    name === "NotAllowedError" || name === "SecurityError" || name === "PermissionDeniedError";

  return isPermissionDenied
    ? {
        kind: "mic-denied",
        message:
          "Microphone access was denied. Allow microphone access in your browser, then try again.",
      }
    : {
        kind: "mic-denied",
        message: "No microphone is available. Check your microphone, then try again.",
      };
};

/** Builds the unsupported-notice copy for a realtime configuration that cannot start. */
export const resolveRealtimeUnavailableMessage = (provider: string, model: string): string =>
  `Realtime is not available for ${provider || "unknown provider"}/${model || "unknown model"} — the Test cannot verify live provider support in this environment.`;

/** Builds the STT envelope shared by the hands-free pipeline engine. */
export const createSttRequestDto = ({
  input,
  audioFormat,
  sttConfig,
  language,
  refId,
  refName,
  agentName,
}: {
  input: string;
  audioFormat: string;
  sttConfig: ModelConfigType;
  language: string | null;
  refId: string;
  refName: string;
  agentName: string | null;
}): STTRequestDto => ({
  input,
  input_mode: "file",
  provider: sttConfig.provider,
  model: sttConfig.model,
  audio_format: audioFormat,
  language,
  stream: false,
  credential_name: sttConfig.credential_name || null,
  is_byok_enabled: sttConfig.is_byok_enabled ?? false,
  ref_type: "Agent",
  ref_id: refId,
  ref_name: refName,
  action: "AgentExecution",
  agent_name: agentName,
});

/** Label for the recovery action a session error offers, or null when none applies. */
export const resolveSessionRecoveryLabel = (kind: VoiceSessionErrorKind): string | null => {
  if (kind === "mic-denied") return "Try again";
  if (kind === "stt" || kind === "network") return "Retry transcription";
  if (kind === "llm") return "Retry reply";
  if (kind === "realtime-blocking") return "Stay on Realtime";
  return null;
};

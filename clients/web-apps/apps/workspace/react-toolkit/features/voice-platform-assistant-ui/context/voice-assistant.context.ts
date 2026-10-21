import { createContext } from "react";

import type { VoiceModelConfig } from "../types/voice-model-config.type";
import type { VoiceEngine, VoiceSessionError, VoiceSessionState } from "../utils/voice-session.util";

/** Spoken-reply failure, split by whether the speech service was reachable. */
export type VoiceSynthesisError = {
  kind: "tts" | "network";
  message: string;
};

/** Voice capabilities shared with the voice thread view; a missing context means voice-unavailable. */
export type VoiceAssistantContextValue = {
  /** Whether streamed replies are spoken aloud (persisted preference). */
  speakReplies: boolean;
  /** Whether a clip is currently producing audio. */
  isPlaying: boolean;
  /** Whether reply speech is being generated. */
  isSynthesizing: boolean;
  /** Last spoken-reply failure, cleared when speech is retried. */
  ttsError: VoiceSynthesisError | null;
  /** Toggles the speak-replies preference; disabling also mutes playback. */
  setSpeakReplies: (value: boolean) => void;
  /** Re-synthesizes the last completed reply. */
  retryLastReply: () => void;
  /** Cancels queued and in-flight live speech, used by barge-in and End Session. */
  abortLiveSynthesis: () => void;
  /** Current hands-free session state. */
  sessionState: VoiceSessionState;
  /** Engine selected for the current session. */
  sessionEngine: VoiceEngine;
  /** Engine currently configured for the agent, shown before a session starts. */
  configuredSessionEngine: VoiceEngine;
  /** True while a Start/End voice session is active. */
  isVoiceSessionActive: boolean;
  /** Starts a hands-free session with the configured engine. */
  startSession: () => void;
  /** Tears down the session and returns to Idle. */
  endSession: () => void;
  /** Blocking session failure, or null. */
  sessionError: VoiceSessionError | null;
  /** Live interim realtime transcript for the current turn, or null. */
  realtimeInterimTranscript: string | null;
  /** True when a blocking realtime failure may offer a session-only Pipeline switch. */
  pipelineSwitchOffered: boolean;
  /** Switches this session to Pipeline after an explicit user confirmation. */
  switchToPipelineForSession: () => void;
  /** Retries the recovery action for the current session error. */
  retrySessionError: () => void;
  /** Clears the session error without changing the engine. */
  clearSessionError: () => void;
  /** Speech-to-Text model config, or null when the agent has none. */
  sttConfig: VoiceModelConfig | null;
  /** Text-to-Speech model config, or null when the agent has none. */
  ttsConfig: VoiceModelConfig | null;
  /** Language hint forwarded to the STT provider, if configured. */
  language: string | null;
  /** Envelope fields shared with the agent execution request. */
  refId: string;
  refName: string;
  agentName: string | null;
};

export const VoiceAssistantContext = createContext<VoiceAssistantContextValue | null>(null);

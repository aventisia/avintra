import { createContext } from "react";

import { ModelConfigType } from "@/types/model-config-type";

/**
 * Voice capabilities shared with the chat UI; consumers treat a missing context
 * as voice-unavailable.
 */
export type AssistantVoiceContextValue = {
  /** Whether streamed replies are spoken aloud (persisted preference). */
  speakReplies: boolean;
  /** Whether a clip is currently producing audio. */
  isPlaying: boolean;
  /** Keys with a clip currently playing or waiting in the queue. */
  activeKeys: string[];
  /** Keys with an in-flight Text-to-Speech request. */
  synthesizingKeys: string[];
  /** Whether the live streamed reply is being spoken right now. */
  isLiveSpeaking: boolean;
  /** Toggles the speak-replies preference; disabling also mutes playback. */
  setSpeakReplies: (value: boolean) => void;
  /** Play/Stop a completed message, synthesizing and caching on first use. */
  toggleMessageSpeech: (key: string, text: string, stopLive?: boolean) => void;
  /** Speech-to-Text model config, or null when the agent has none. */
  sttConfig: ModelConfigType | null;
  /** Text-to-Speech model config, or null when the agent has none. */
  ttsConfig: ModelConfigType | null;
  /** Language hint forwarded to the STT provider, if configured. */
  language: string | null;
  /** Envelope fields shared with the chat execution request. */
  refId: string;
  refName: string;
  agentName: string | null;
};

export const AssistantVoiceContext = createContext<AssistantVoiceContextValue | null>(null);

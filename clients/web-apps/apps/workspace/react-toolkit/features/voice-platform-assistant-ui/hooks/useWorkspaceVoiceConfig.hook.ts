import { useMemo } from "react";

import type { AssistChatDto } from "@/features/04-assist/my-chats/dtos/assist-chat-dto";

import type {
  RealtimeVoiceSettings,
  VoiceModelConfig,
  VoiceSettings,
} from "../types/voice-model-config.type";

/** Voice configuration the workspace UI can resolve for a published agent. */
export type WorkspaceVoiceAgentConfig = {
  stt: VoiceModelConfig | null;
  tts: VoiceModelConfig | null;
  voice: VoiceSettings | null;
  realtime: RealtimeVoiceSettings;
  isTextToSpeechConfigured: boolean;
  realtimeReady: boolean;
  pipelineReady: boolean;
  introText: string;
  notConfiguredReasons: string[];
  sfx: { enabled: false };
  pronunciations: Array<{ term: string; pronunciation: string }>;
};

const EMPTY_REALTIME: RealtimeVoiceSettings = {
  provider: "",
  model: "",
  credentialName: "",
  voice: "",
  language: "",
};

export const NO_VOICE_AGENT_REASON = "Select a voice agent to start a voice session.";
export const STT_UNCONFIGURED_REASON =
  "Speech-to-Text model: not configured for this agent (assist-chat endpoint exposes no STT fields).";
export const TTS_UNCONFIGURED_REASON =
  "Text-to-Speech model: not configured for this agent (assist-chat endpoint exposes no TTS fields).";
export const REALTIME_UNCONFIGURED_REASON =
  "Realtime provider/model: not configured for this agent (assist-chat endpoint exposes no realtime fields).";

/**
 * Resolves the voice configuration for a published agent.
 * The assist-chat endpoint exposes no speech model fields yet, so Pipeline and Realtime
 * readiness are false by default and the UI renders the not-configured notice.
 */
export const useWorkspaceVoiceConfig = (
  agent: AssistChatDto | undefined,
  override?: Partial<WorkspaceVoiceAgentConfig> | null,
): WorkspaceVoiceAgentConfig =>
  useMemo(() => {
    if (!agent) {
      return {
        stt: null,
        tts: null,
        voice: null,
        realtime: EMPTY_REALTIME,
        isTextToSpeechConfigured: false,
        realtimeReady: false,
        pipelineReady: false,
        introText: "",
        notConfiguredReasons: [NO_VOICE_AGENT_REASON],
        sfx: { enabled: false },
        pronunciations: [],
      };
    }

    const base: WorkspaceVoiceAgentConfig = {
      stt: null,
      tts: null,
      voice: null,
      realtime: EMPTY_REALTIME,
      isTextToSpeechConfigured: false,
      realtimeReady: false,
      pipelineReady: false,
      introText: agent.firstSpeaker === "ai" ? (agent.voiceIntroduction?.trim() ?? "") : "",
      notConfiguredReasons: [],
      sfx: { enabled: false },
      pronunciations: [],
    };

    const merged: WorkspaceVoiceAgentConfig = { ...base, ...(override ?? {}) };
    const pipelineReady = Boolean(merged.stt?.model && merged.tts?.model);
    const realtimeReady = Boolean(merged.realtime.provider && merged.realtime.model);
    const notConfiguredReasons: string[] = [];

    if (!merged.stt?.model) notConfiguredReasons.push(STT_UNCONFIGURED_REASON);
    if (!merged.tts?.model) notConfiguredReasons.push(TTS_UNCONFIGURED_REASON);
    if (!realtimeReady) notConfiguredReasons.push(REALTIME_UNCONFIGURED_REASON);

    return {
      ...merged,
      isTextToSpeechConfigured: Boolean(merged.tts?.model),
      realtimeReady,
      pipelineReady,
      notConfiguredReasons,
    };
  }, [agent, override]);

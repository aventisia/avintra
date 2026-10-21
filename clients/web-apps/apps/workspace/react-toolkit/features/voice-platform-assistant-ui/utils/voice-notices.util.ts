import type {
  RealtimeVoiceSettings,
  VoiceModelConfig,
} from "../types/voice-model-config.type";
import { type VoiceEngine, resolveWorkspaceVoiceEngine } from "./voice-session.util";

/** Notices the workspace voice adapter can honestly derive from published agent data. */
export type WorkspaceVoiceNotices = {
  engineMode: VoiceEngine;
  missingCapabilities: string[];
  webhookConfigured: false;
};

/** Copy for capabilities the workspace v1 adapter cannot read from the assist-chat endpoint. */
export const UNKNOWN_VOICE_CONFIG_NOTICE =
  "Transcript webhooks, escalation, and other deferred voice features are not exposed by the workspace agent configuration, so their state is unknown.";

/** Derives the voice notices shown above the transcript from the config adapter output. */
export const getWorkspaceVoiceNotices = ({
  stt,
  tts,
  realtime,
  realtimeReady,
}: {
  stt: VoiceModelConfig | null;
  tts: VoiceModelConfig | null;
  realtime: RealtimeVoiceSettings;
  realtimeReady: boolean;
}): WorkspaceVoiceNotices => {
  const missingCapabilities: string[] = [];

  if (!stt?.model) missingCapabilities.push("Speech-to-Text");
  if (!tts?.model) missingCapabilities.push("Text-to-Speech");
  if (!realtime.provider || !realtime.model) missingCapabilities.push("Realtime");

  return {
    engineMode: resolveWorkspaceVoiceEngine(realtimeReady),
    missingCapabilities,
    webhookConfigured: false,
  };
};

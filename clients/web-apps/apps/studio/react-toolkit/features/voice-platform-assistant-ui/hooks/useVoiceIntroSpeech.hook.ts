import { useEffect, useRef } from "react";

import { TTSRequestDto } from "@/features/dynamic-config-panel/dtos/tts-model-dto";
import { ModelConfigType, VoiceConfigType } from "@/types/model-config-type";

import { synthesizeTts } from "../apis/voice-apis";
import { LIVE_SPEECH_KEY, useVoicePlaybackStore } from "../stores/voice-playback.store";
import type { VoiceEngine } from "../utils/voice-session.util";

const resolveAudioMimeType = (audio: string): string =>
  /^data:([^;,]+)/.exec(audio)?.[1] ?? "audio/mpeg";

type UseVoiceIntroSpeechParams = {
  /** Seeded assistant introduction to speak. */
  text: string;
  /** True when this panel is the Voice Test with spoken replies enabled. */
  enabled: boolean;
  /** Engine for the session; realtime introductions arrive as provider audio. */
  engine?: VoiceEngine;
  /** Identifies the current session; a new value allows one new introduction. */
  sessionKey: string;
  ttsConfig: ModelConfigType | null;
  voiceConfig: VoiceConfigType | null;
  refId: string;
  refName: string;
  agentName: string | null;
};

/** Speaks the seeded Voice Test introduction once per session. */
export const useVoiceIntroSpeech = ({
  text,
  enabled,
  engine,
  sessionKey,
  ttsConfig,
  voiceConfig,
  refId,
  refName,
  agentName,
}: UseVoiceIntroSpeechParams) => {
  const spokenSessionRef = useRef<string | null>(null);

  useEffect(() => {
    if (spokenSessionRef.current === sessionKey) return;
    spokenSessionRef.current = sessionKey;
    if (!enabled || engine === "realtime" || !ttsConfig?.model || !text.trim()) return;

    const controller = new AbortController();
    const requestDto: TTSRequestDto = {
      provider: ttsConfig.provider,
      input: text,
      model: ttsConfig.model,
      voice_id: voiceConfig?.voice || null,
      language: voiceConfig?.language || null,
      speed: voiceConfig?.speed,
      pronunciations: null,
      stream: false,
      credential_name: ttsConfig.credential_name || null,
      is_byok_enabled: ttsConfig.is_byok_enabled ?? false,
      ref_type: "Agent",
      ref_id: refId,
      ref_name: refName,
      action: "AgentExecution",
      agent_name: agentName ?? null,
    };

    void (async () => {
      try {
        const response = await synthesizeTts(requestDto, controller.signal);
        if (controller.signal.aborted || !response.output) return;
        useVoicePlaybackStore.getState().enqueue(LIVE_SPEECH_KEY, [
          {
            id: crypto.randomUUID(),
            audio: response.output,
            mimeType: resolveAudioMimeType(response.output),
          },
        ]);
      } catch (error) {
        if (controller.signal.aborted) return;
        console.error("Voice Test introduction speech failed:", error);
      }
    })();

    return () => controller.abort();
  }, [enabled, engine, sessionKey, text, ttsConfig, voiceConfig, refId, refName, agentName]);
};

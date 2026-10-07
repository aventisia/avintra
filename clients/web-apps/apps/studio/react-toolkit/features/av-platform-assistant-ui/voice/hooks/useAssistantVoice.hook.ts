import { toast } from "@avplatform/ui/sonner";
import { useCallback, useEffect, useRef } from "react";

import { TTSRequestDto } from "@/features/dynamic-config-panel/dtos/tts-model-dto";
import { ModelConfigType, VoiceConfigType } from "@/types/model-config-type";

import { synthesizeTts } from "../apis/voice-apis";
import {
  LIVE_SPEECH_KEY,
  VoiceAudioClip,
  useVoicePlaybackStore,
} from "../stores/voice-playback.store";
import { createStreamingSpeechChunker, splitIntoSpeechChunks } from "../utils/text-chunker.util";

type UseAssistantVoiceParams = {
  /** Text-to-Speech model config, or null when not configured. */
  ttsConfig: ModelConfigType | null;
  /** Voice settings applied to every synthesis request. */
  voiceConfig: VoiceConfigType | null;
  /** True when the agent has both speech models configured. */
  isConfigured: boolean;
  /** Envelope fields shared with the chat execution request. */
  refId: string;
  refName: string;
  agentName?: string | null;
};

/** Extracts the MIME type from a data URL, defaulting to ElevenLabs MP3. */
const resolveAudioMimeType = (audio: string): string =>
  /^data:([^;,]+)/.exec(audio)?.[1] ?? "audio/mpeg";

/**
 * Orchestrates spoken replies for the Studio ChatAgent test panel.
 *
 * It exposes the adapter callbacks (`onTextDelta`/`onRunFinished`) that stream
 * reply text into sentence-sized TTS requests, plus a per-message play/pause
 * toggle backed by the shared FIFO player in `voice-playback.store`.
 */
export const useAssistantVoice = ({
  ttsConfig,
  voiceConfig,
  isConfigured,
  refId,
  refName,
  agentName,
}: UseAssistantVoiceParams) => {
  const speakReplies = useVoicePlaybackStore((state) => state.speakReplies);
  const isPlaying = useVoicePlaybackStore((state) => state.isPlaying);
  const isSynthesizing = useVoicePlaybackStore((state) => state.isSynthesizing);
  const activeKey = useVoicePlaybackStore((state) => state.activeKey);
  const setSpeakReplies = useVoicePlaybackStore((state) => state.setSpeakReplies);
  const stop = useVoicePlaybackStore((state) => state.stop);

  // Latest config for the stable callbacks handed to the chat adapter.
  const configRef = useRef({
    ttsConfig,
    voiceConfig,
    isConfigured,
    refId,
    refName,
    agentName,
    speakReplies,
  });
  configRef.current = {
    ttsConfig,
    voiceConfig,
    isConfigured,
    refId,
    refName,
    agentName,
    speakReplies,
  };

  const chunkerRef = useRef(createStreamingSpeechChunker());
  // Serializes synthesis requests so clips enqueue in their original order.
  const chainRef = useRef<Promise<void>>(Promise.resolve());
  const pendingSynthesisRef = useRef(0);
  const pendingMessageKeysRef = useRef<Set<string>>(new Set());

  const synthesizeChunk = useCallback(async (text: string): Promise<VoiceAudioClip | null> => {
    const config = configRef.current;
    if (!config.ttsConfig?.model) return null;

    const requestDto: TTSRequestDto = {
      provider: config.ttsConfig.provider,
      input: text,
      model: config.ttsConfig.model,
      voice_id: config.voiceConfig?.voice || null,
      language: config.voiceConfig?.language || null,
      speed: config.voiceConfig?.speed,
      stream: false,
      credential_name: config.ttsConfig.credential_name || null,
      is_byok_enabled: config.ttsConfig.is_byok_enabled ?? false,
      ref_type: "Agent",
      ref_id: config.refId,
      ref_name: config.refName,
      action: "AgentExecution",
      agent_name: config.agentName ?? null,
    };

    const response = await synthesizeTts(requestDto);
    const output = response.output;
    if (!output) {
      if (response.error) throw new Error(response.error);
      return null;
    }
    return { id: crypto.randomUUID(), audio: output, mimeType: resolveAudioMimeType(output) };
  }, []);

  /** Runs a synthesis task after any in-flight ones, tracking the busy state. */
  const trackSynthesis = useCallback((task: () => Promise<void>) => {
    pendingSynthesisRef.current += 1;
    useVoicePlaybackStore.getState().setSynthesizing(true);

    chainRef.current = chainRef.current
      .then(task)
      .catch((error: unknown) => {
        console.error("Chat agent voice synthesis failed:", error);
        toast.error("Could not generate speech for this reply.");
      })
      .finally(() => {
        pendingSynthesisRef.current -= 1;
        if (pendingSynthesisRef.current <= 0) {
          pendingSynthesisRef.current = 0;
          useVoicePlaybackStore.getState().setSynthesizing(false);
        }
      });
  }, []);

  /** Synthesizes each text in order and enqueues the resulting clips. */
  const queueSpeech = useCallback(
    (key: string, texts: string[]) => {
      if (texts.length === 0) return;
      trackSynthesis(async () => {
        const clips: VoiceAudioClip[] = [];
        for (const text of texts) {
          const clip = await synthesizeChunk(text);
          if (clip) clips.push(clip);
        }
        if (clips.length > 0) useVoicePlaybackStore.getState().enqueue(key, clips);
      });
    },
    [synthesizeChunk, trackSynthesis],
  );

  /** Adapter callback: turns streamed reply deltas into queued speech. */
  const onTextDelta = useCallback(
    (delta: string) => {
      const config = configRef.current;
      if (!config.speakReplies || !config.isConfigured) return;
      queueSpeech(LIVE_SPEECH_KEY, chunkerRef.current.push(delta));
    },
    [queueSpeech],
  );

  /** Adapter callback: flushes the trailing sentence when a run settles. */
  const onRunFinished = useCallback(() => {
    const remaining = chunkerRef.current.flush();
    const config = configRef.current;
    if (config.speakReplies && config.isConfigured && remaining.length > 0) {
      queueSpeech(LIVE_SPEECH_KEY, remaining);
    }
  }, [queueSpeech]);

  /** Plays/pauses a completed message, synthesizing and caching on first use. */
  const toggleMessageSpeech = useCallback(
    (key: string, text: string) => {
      const store = useVoicePlaybackStore.getState();
      const cached = store.getCachedClips(key);
      if (cached?.length) {
        store.togglePauseResume(key, cached);
        return;
      }

      if (pendingMessageKeysRef.current.has(key)) return;
      const chunks = splitIntoSpeechChunks(text);
      if (chunks.length === 0) return;

      pendingMessageKeysRef.current.add(key);
      trackSynthesis(async () => {
        try {
          const clips: VoiceAudioClip[] = [];
          for (const chunk of chunks) {
            const clip = await synthesizeChunk(chunk);
            if (clip) clips.push(clip);
          }
          if (clips.length > 0) {
            const currentStore = useVoicePlaybackStore.getState();
            currentStore.cacheClips(key, clips);
            currentStore.togglePauseResume(key, clips);
          }
        } finally {
          pendingMessageKeysRef.current.delete(key);
        }
      });
    },
    [synthesizeChunk, trackSynthesis],
  );

  // Stop playback if the voice config disappears (e.g. models cleared).
  useEffect(() => {
    if (!isConfigured) stop();
  }, [isConfigured, stop]);

  return {
    speakReplies,
    isPlaying,
    isSynthesizing,
    activeKey,
    setSpeakReplies,
    onTextDelta,
    onRunFinished,
    toggleMessageSpeech,
    stop,
  };
};

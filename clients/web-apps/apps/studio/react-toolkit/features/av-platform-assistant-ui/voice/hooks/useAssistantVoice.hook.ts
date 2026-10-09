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
  ttsConfig: ModelConfigType | null;
  voiceConfig: VoiceConfigType | null;
  isConfigured: boolean;
  refId: string;
  refName: string;
  agentName?: string | null;
};

const resolveAudioMimeType = (audio: string): string =>
  /^data:([^;,]+)/.exec(audio)?.[1] ?? "audio/mpeg";

/** Drives spoken replies and per-message playback for the Studio ChatAgent test panel. */
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
  const activeKeys = useVoicePlaybackStore((state) => state.activeKeys);
  const synthesizingKeys = useVoicePlaybackStore((state) => state.synthesizingKeys);
  const setSpeakReplies = useVoicePlaybackStore((state) => state.setSpeakReplies);
  const stop = useVoicePlaybackStore((state) => state.stop);
  const reset = useVoicePlaybackStore((state) => state.reset);
  const isLiveSpeaking =
    activeKeys.includes(LIVE_SPEECH_KEY) || synthesizingKeys.includes(LIVE_SPEECH_KEY);

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
  const chainRef = useRef<Promise<void>>(Promise.resolve());
  const abortRef = useRef<Map<string, AbortController>>(new Map());
  const epochRef = useRef<Map<string, number>>(new Map());
  const pendingRef = useRef<Map<string, number>>(new Map());
  const disposedRef = useRef(false);

  const synthesizeChunk = useCallback(
    async (text: string, signal?: AbortSignal): Promise<VoiceAudioClip | null> => {
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

      const response = await synthesizeTts(requestDto, signal);
      const output = response.output;
      if (!output) {
        if (response.error) throw new Error(response.error);
        return null;
      }
      return { id: crypto.randomUUID(), audio: output, mimeType: resolveAudioMimeType(output) };
    },
    [],
  );

  const getEpoch = useCallback((key: string): number => epochRef.current.get(key) ?? 0, []);

  const getSignal = useCallback((key: string): AbortSignal => {
    let controller = abortRef.current.get(key);
    if (!controller) {
      controller = new AbortController();
      abortRef.current.set(key, controller);
    }
    return controller.signal;
  }, []);

  const abortKey = useCallback(
    (key: string) => {
      abortRef.current.get(key)?.abort();
      abortRef.current.delete(key);
      pendingRef.current.delete(key);
      epochRef.current.set(key, getEpoch(key) + 1);
      useVoicePlaybackStore.getState().markSynthesizing(key, false);
    },
    [getEpoch],
  );

  const trackSynthesis = useCallback(
    (key: string, task: () => Promise<void>, signal?: AbortSignal) => {
      const epoch = getEpoch(key);
      pendingRef.current.set(key, (pendingRef.current.get(key) ?? 0) + 1);
      useVoicePlaybackStore.getState().markSynthesizing(key, true);

      chainRef.current = chainRef.current
        .then(task)
        .catch((error: unknown) => {
          if (disposedRef.current || signal?.aborted || getEpoch(key) !== epoch) return;
          console.error("Chat agent voice synthesis failed:", error);
          toast.error("Could not generate speech for this reply.");
        })
        .finally(() => {
          const pending = (pendingRef.current.get(key) ?? 1) - 1;
          if (pending > 0) {
            pendingRef.current.set(key, pending);
            return;
          }
          pendingRef.current.delete(key);
          if (disposedRef.current || getEpoch(key) !== epoch) return;
          abortRef.current.delete(key);
          useVoicePlaybackStore.getState().markSynthesizing(key, false);
        });
    },
    [getEpoch],
  );

  const queueSpeech = useCallback(
    (key: string, texts: string[], signal?: AbortSignal) => {
      if (texts.length === 0) return;
      trackSynthesis(
        key,
        async () => {
          const clips: VoiceAudioClip[] = [];
          for (const text of texts) {
            if (signal?.aborted) break;
            const clip = await synthesizeChunk(text, signal);
            if (clip) clips.push(clip);
          }
          if (signal?.aborted || clips.length === 0) return;
          useVoicePlaybackStore.getState().enqueue(key, clips);
        },
        signal,
      );
    },
    [synthesizeChunk, trackSynthesis],
  );

  const onTextDelta = useCallback(
    (delta: string) => {
      if (disposedRef.current) return;
      const config = configRef.current;
      if (!config.speakReplies || !config.isConfigured) return;
      queueSpeech(LIVE_SPEECH_KEY, chunkerRef.current.push(delta), getSignal(LIVE_SPEECH_KEY));
    },
    [queueSpeech, getSignal],
  );

  const onRunFinished = useCallback(() => {
    if (disposedRef.current) return;
    const remaining = chunkerRef.current.flush();
    const config = configRef.current;
    if (config.speakReplies && config.isConfigured && remaining.length > 0) {
      queueSpeech(LIVE_SPEECH_KEY, remaining, getSignal(LIVE_SPEECH_KEY));
    }
  }, [queueSpeech, getSignal]);

  const toggleMessageSpeech = useCallback(
    (key: string, text: string, stopLive = false) => {
      const store = useVoicePlaybackStore.getState();
      const isBusy =
        stopLive || store.activeKeys.includes(key) || store.synthesizingKeys.includes(key);

      if (isBusy) {
        abortKey(key);
        store.stopKey(key);
        if (stopLive) {
          abortKey(LIVE_SPEECH_KEY);
          store.stopKey(LIVE_SPEECH_KEY);
        }
        return;
      }

      const cached = store.getCachedClips(key);
      if (cached?.length) {
        store.enqueue(key, cached);
        return;
      }

      const chunks = splitIntoSpeechChunks(text);
      if (chunks.length === 0) return;

      const signal = getSignal(key);
      trackSynthesis(
        key,
        async () => {
          const clips: VoiceAudioClip[] = [];
          for (const chunk of chunks) {
            if (signal.aborted) break;
            const clip = await synthesizeChunk(chunk, signal);
            if (clip) clips.push(clip);
          }
          if (signal.aborted || clips.length === 0) return;
          const currentStore = useVoicePlaybackStore.getState();
          currentStore.cacheClips(key, clips);
          currentStore.enqueue(key, clips);
        },
        signal,
      );
    },
    [abortKey, getSignal, synthesizeChunk, trackSynthesis],
  );

  const abortLiveSynthesis = useCallback(() => {
    abortKey(LIVE_SPEECH_KEY);
    chunkerRef.current.reset();
  }, [abortKey]);

  const handleSetSpeakReplies = useCallback(
    (value: boolean) => {
      configRef.current = { ...configRef.current, speakReplies: value };
      setSpeakReplies(value);
      if (!value) abortLiveSynthesis();
    },
    [setSpeakReplies, abortLiveSynthesis],
  );

  useEffect(() => {
    if (!isConfigured) stop();
  }, [isConfigured, stop]);

  useEffect(() => {
    disposedRef.current = false;
    const abortControllers = abortRef.current;
    const epochs = epochRef.current;
    const pending = pendingRef.current;
    const chunker = chunkerRef.current;
    return () => {
      disposedRef.current = true;
      abortControllers.forEach((controller) => controller.abort());
      abortControllers.clear();
      epochs.clear();
      pending.clear();
      chunker.reset();
      reset();
    };
  }, [reset]);

  return {
    speakReplies,
    isPlaying,
    activeKeys,
    synthesizingKeys,
    isLiveSpeaking,
    setSpeakReplies: handleSetSpeakReplies,
    onTextDelta,
    onRunFinished,
    toggleMessageSpeech,
    stop,
  };
};

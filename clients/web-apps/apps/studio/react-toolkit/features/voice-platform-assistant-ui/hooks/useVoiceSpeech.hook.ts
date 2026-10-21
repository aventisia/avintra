import { toast } from "@avplatform/ui/sonner";
import { useCallback, useEffect, useRef, useState } from "react";

import { TTSRequestDto } from "@/features/dynamic-config-panel/dtos/tts-model-dto";
import { useVoiceSfx } from "@/features/dynamic-config-panel/hooks/useVoiceSfx.hook";
import { ModelConfigType, VoiceConfigType } from "@/types/model-config-type";

import { synthesizeTts } from "../apis/voice-apis";
import { VoiceSynthesisError } from "../context/voice-assistant.context";
import {
  LIVE_SPEECH_KEY,
  VoiceAudioClip,
  useVoicePlaybackStore,
} from "../stores/voice-playback.store";
import { createStreamingSpeechChunker, splitIntoSpeechChunks } from "../utils/text-chunker.util";
import { isNetworkRequestFailure } from "../utils/voice-controls.util";

type UseVoiceSpeechParams = {
  ttsConfig: ModelConfigType | null;
  voiceConfig: VoiceConfigType | null;
  isTextToSpeechConfigured: boolean;
  refId: string;
  refName: string;
  agentName?: string | null;
  pronunciations?: Array<{ term: string; pronunciation: string }>;
  sfx?: { enabled: boolean; toolCallCueUrl: string; ambienceUrl: string };
};

const resolveAudioMimeType = (audio: string): string =>
  /^data:([^;,]+)/.exec(audio)?.[1] ?? "audio/mpeg";

const resolveSynthesisError = (error: unknown): VoiceSynthesisError =>
  isNetworkRequestFailure(error)
    ? {
        kind: "network",
        message: "Could not reach the speech service. Check your connection and retry.",
      }
    : { kind: "tts", message: "Could not generate speech for this reply." };

/** Drives spoken replies for the Voice Test panel. */
export const useVoiceSpeech = ({
  ttsConfig,
  voiceConfig,
  isTextToSpeechConfigured,
  refId,
  refName,
  agentName,
  pronunciations,
  sfx,
}: UseVoiceSpeechParams) => {
  const speakReplies = useVoicePlaybackStore((state) => state.speakReplies);
  const isPlaying = useVoicePlaybackStore((state) => state.isPlaying);
  const setSpeakReplies = useVoicePlaybackStore((state) => state.setSpeakReplies);
  const stop = useVoicePlaybackStore((state) => state.stop);
  const sfxPlayer = useVoiceSfx();
  const [isSynthesizing, setIsSynthesizing] = useState(false);
  const [ttsError, setTtsError] = useState<VoiceSynthesisError | null>(null);

  const configRef = useRef({
    ttsConfig,
    voiceConfig,
    isTextToSpeechConfigured,
    refId,
    refName,
    agentName,
    speakReplies,
    pronunciations,
    sfx,
  });
  configRef.current = {
    ttsConfig,
    voiceConfig,
    isTextToSpeechConfigured,
    refId,
    refName,
    agentName,
    speakReplies,
    pronunciations,
    sfx,
  };

  const chunkerRef = useRef(createStreamingSpeechChunker());
  const chainRef = useRef<Promise<void>>(Promise.resolve());
  const abortRef = useRef<Map<string, AbortController>>(new Map());
  const epochRef = useRef<Map<string, number>>(new Map());
  const pendingRef = useRef<Map<string, number>>(new Map());
  const disposedRef = useRef(false);
  const replyBufferRef = useRef("");
  const lastReplyTextRef = useRef("");

  const syncSynthesisState = useCallback(() => {
    if (disposedRef.current) return;
    const pending = Array.from(pendingRef.current.values()).reduce(
      (total, count) => total + count,
      0,
    );
    setIsSynthesizing(pending > 0);
  }, []);

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
        pronunciations:
          config.pronunciations && config.pronunciations.length > 0 ? config.pronunciations : null,
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
      syncSynthesisState();
    },
    [getEpoch, syncSynthesisState],
  );

  const trackSynthesis = useCallback(
    (key: string, task: () => Promise<void>, signal?: AbortSignal) => {
      const epoch = getEpoch(key);
      pendingRef.current.set(key, (pendingRef.current.get(key) ?? 0) + 1);
      syncSynthesisState();

      chainRef.current = chainRef.current
        .then(task)
        .catch((error: unknown) => {
          if (disposedRef.current || signal?.aborted || getEpoch(key) !== epoch) return;
          console.error("Voice agent speech synthesis failed:", error);
          setTtsError(resolveSynthesisError(error));
          toast.error("Could not generate speech for this reply.");
        })
        .finally(() => {
          const pending = (pendingRef.current.get(key) ?? 1) - 1;
          if (pending > 0) {
            pendingRef.current.set(key, pending);
          } else {
            pendingRef.current.delete(key);
          }
          syncSynthesisState();
          if (pending > 0) return;
          if (disposedRef.current || getEpoch(key) !== epoch) return;
          abortRef.current.delete(key);
        });
    },
    [getEpoch, syncSynthesisState],
  );

  const queueSpeech = useCallback(
    (key: string, texts: string[], signal?: AbortSignal) => {
      if (texts.length === 0) return;
      setTtsError(null);
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
      replyBufferRef.current += delta;
      const config = configRef.current;
      if (!config.speakReplies || !config.isTextToSpeechConfigured) return;
      queueSpeech(LIVE_SPEECH_KEY, chunkerRef.current.push(delta), getSignal(LIVE_SPEECH_KEY));
    },
    [queueSpeech, getSignal],
  );

  const onRunFinished = useCallback(() => {
    sfxPlayer.stopAmbience();
    if (disposedRef.current) return;
    lastReplyTextRef.current = replyBufferRef.current.trim();
    replyBufferRef.current = "";
    const remaining = chunkerRef.current.flush();
    const config = configRef.current;
    if (config.speakReplies && config.isTextToSpeechConfigured && remaining.length > 0) {
      queueSpeech(LIVE_SPEECH_KEY, remaining, getSignal(LIVE_SPEECH_KEY));
    }
  }, [queueSpeech, getSignal, sfxPlayer]);

  const retryLastReply = useCallback(() => {
    if (disposedRef.current) return;
    const text = lastReplyTextRef.current;
    if (!text || !configRef.current.ttsConfig?.model) return;
    queueSpeech(LIVE_SPEECH_KEY, splitIntoSpeechChunks(text), getSignal(LIVE_SPEECH_KEY));
  }, [queueSpeech, getSignal]);

  const onRunStart = useCallback(() => {
    const config = configRef.current;
    if (!config.sfx?.enabled) return;
    sfxPlayer.startAmbience(config.sfx.ambienceUrl);
  }, [sfxPlayer]);

  const onToolCallFrame = useCallback(() => {
    const config = configRef.current;
    if (!config.sfx?.enabled) return;
    sfxPlayer.playToolCallCue(config.sfx.toolCallCueUrl);
  }, [sfxPlayer]);

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
    if (!isTextToSpeechConfigured) stop();
  }, [isTextToSpeechConfigured, stop]);

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
      stop();
    };
  }, [stop]);

  return {
    speakReplies,
    isPlaying,
    isSynthesizing,
    ttsError,
    setSpeakReplies: handleSetSpeakReplies,
    retryLastReply,
    abortLiveSynthesis,
    onTextDelta,
    onRunStart,
    onToolCallFrame,
    onRunFinished,
  };
};

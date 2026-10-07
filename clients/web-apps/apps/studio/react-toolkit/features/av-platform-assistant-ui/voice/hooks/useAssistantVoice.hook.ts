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
  const activeKeys = useVoicePlaybackStore((state) => state.activeKeys);
  const synthesizingKeys = useVoicePlaybackStore((state) => state.synthesizingKeys);
  const setSpeakReplies = useVoicePlaybackStore((state) => state.setSpeakReplies);
  const stop = useVoicePlaybackStore((state) => state.stop);
  const isLiveSpeaking =
    activeKeys.includes(LIVE_SPEECH_KEY) || synthesizingKeys.includes(LIVE_SPEECH_KEY);

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
  // Per-key synthesis controls. Aborting a key cancels its in-flight request;
  // bumping its epoch invalidates anything already scheduled for that key so a
  // late-resolving response cannot restart playback after a Stop/mute.
  const abortRef = useRef<Map<string, AbortController>>(new Map());
  const epochRef = useRef<Map<string, number>>(new Map());

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

  /** Reads a key's current invalidation epoch. */
  const getEpoch = useCallback((key: string): number => epochRef.current.get(key) ?? 0, []);

  /** Returns (creating if needed) the abort signal guarding a key's synthesis. */
  const getSignal = useCallback((key: string): AbortSignal => {
    let controller = abortRef.current.get(key);
    if (!controller) {
      controller = new AbortController();
      abortRef.current.set(key, controller);
    }
    return controller.signal;
  }, []);

  /**
   * Cancels a key's in-flight request and invalidates anything already
   * scheduled for it, so a late response cannot restart playback.
   */
  const abortKey = useCallback(
    (key: string) => {
      abortRef.current.get(key)?.abort();
      abortRef.current.delete(key);
      epochRef.current.set(key, getEpoch(key) + 1);
      useVoicePlaybackStore.getState().markSynthesizing(key, false);
    },
    [getEpoch],
  );

  /** Runs a synthesis task after any in-flight ones, tracking the busy state. */
  const trackSynthesis = useCallback(
    (key: string, task: () => Promise<void>, signal?: AbortSignal) => {
      // Capture the epoch so a Stop can invalidate this task's bookkeeping.
      const epoch = getEpoch(key);
      useVoicePlaybackStore.getState().markSynthesizing(key, true);

      chainRef.current = chainRef.current
        .then(task)
        .catch((error: unknown) => {
          // An abort is an intentional Stop/mute, not a synthesis failure.
          if (signal?.aborted || getEpoch(key) !== epoch) return;
          console.error("Chat agent voice synthesis failed:", error);
          toast.error("Could not generate speech for this reply.");
        })
        .finally(() => {
          if (getEpoch(key) !== epoch) return;
          abortRef.current.delete(key);
          useVoicePlaybackStore.getState().markSynthesizing(key, false);
        });
    },
    [getEpoch],
  );

  /** Synthesizes each text in order and enqueues the resulting clips. */
  const queueSpeech = useCallback(
    (key: string, texts: string[], signal?: AbortSignal) => {
      if (texts.length === 0) return;
      trackSynthesis(
        key,
        async () => {
          const clips: VoiceAudioClip[] = [];
          for (const text of texts) {
            // Stop before issuing the next request once cancelled.
            if (signal?.aborted) break;
            const clip = await synthesizeChunk(text, signal);
            if (clip) clips.push(clip);
          }
          // Drop the batch entirely if the user cancelled mid-synthesis.
          if (signal?.aborted || clips.length === 0) return;
          useVoicePlaybackStore.getState().enqueue(key, clips);
        },
        signal,
      );
    },
    [synthesizeChunk, trackSynthesis],
  );

  /** Adapter callback: turns streamed reply deltas into queued speech. */
  const onTextDelta = useCallback(
    (delta: string) => {
      const config = configRef.current;
      if (!config.speakReplies || !config.isConfigured) return;
      queueSpeech(LIVE_SPEECH_KEY, chunkerRef.current.push(delta), getSignal(LIVE_SPEECH_KEY));
    },
    [queueSpeech, getSignal],
  );

  /** Adapter callback: flushes the trailing sentence when a run settles. */
  const onRunFinished = useCallback(() => {
    const remaining = chunkerRef.current.flush();
    const config = configRef.current;
    if (config.speakReplies && config.isConfigured && remaining.length > 0) {
      queueSpeech(LIVE_SPEECH_KEY, remaining, getSignal(LIVE_SPEECH_KEY));
    }
  }, [queueSpeech, getSignal]);

  /**
   * Per-message Play/Stop. Starts synthesis (or replays cached clips) when the
   * message is idle; when it is synthesizing or playing, cancels the request,
   * drops its queued clips and halts playback.
   */
  const toggleMessageSpeech = useCallback(
    (key: string, text: string, stopLive = false) => {
      const store = useVoicePlaybackStore.getState();
      const isBusy =
        stopLive || store.activeKeys.includes(key) || store.synthesizingKeys.includes(key);

      if (isBusy) {
        abortKey(key);
        store.stopKey(key);
        // The live stream is speaking the last reply: cancel it too so no
        // further chunks are synthesized or played until Play is pressed again.
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

  /** Aborts the live stream's synthesis and drops its buffered text on mute. */
  const abortLiveSynthesis = useCallback(() => {
    abortKey(LIVE_SPEECH_KEY);
    chunkerRef.current.reset();
  }, [abortKey]);

  /**
   * Toggles the persisted "Speak replies" preference. Muting aborts any
   * in-flight TTS requests and playback immediately; unmuting lets subsequent
   * stream deltas be spoken again.
   */
  const handleSetSpeakReplies = useCallback(
    (value: boolean) => {
      // Gate the stream synchronously so a delta arriving before the next
      // render cannot schedule new speech.
      configRef.current = { ...configRef.current, speakReplies: value };
      setSpeakReplies(value);
      if (!value) abortLiveSynthesis();
    },
    [setSpeakReplies, abortLiveSynthesis],
  );

  // Stop playback if the voice config disappears (e.g. models cleared).
  useEffect(() => {
    if (!isConfigured) stop();
  }, [isConfigured, stop]);

  // Release in-flight synthesis and playback when the controller unmounts.
  useEffect(
    () => () => {
      abortRef.current.forEach((controller) => controller.abort());
      abortRef.current.clear();
      stop();
    },
    [stop],
  );

  return {
    speakReplies,
    isPlaying,
    isSynthesizing,
    activeKey,
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

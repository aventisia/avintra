import { useAui } from "@assistant-ui/react";
import { type MutableRefObject, useCallback, useEffect, useRef } from "react";

import {
  type RealtimeServerFrame,
  useRealtimeVoiceSession,
} from "@/features/dynamic-config-panel/hooks/useRealtimeVoiceSession.hook";
import { getStudioEnvHeaders, getStudioSpaceId } from "@/utils/space-headers";

import { useVoicePlaybackStore } from "../stores/voice-playback.store";
import {
  decodePcm16Base64,
  encodePcm16Base64,
  encodeWavBase64,
} from "../utils/realtime-audio.util";
import {
  VOICE_VAD_DEFAULTS,
  type VoiceSessionError,
  type VoiceSessionState,
  resolveRealtimeUnavailableMessage,
} from "../utils/voice-session.util";
import { VoiceActivityCapture } from "../utils/voice-vad.util";
import type { VoiceEngineBridge, VoiceSessionConfig } from "./useVoiceSession.hook";

const REALTIME_SPEECH_KEY = "realtime";
const REALTIME_CHUNK_MS = 100;

type UseVoiceRealtimeEngineParams = {
  stream: MediaStream;
  config: VoiceSessionConfig;
  bridge: MutableRefObject<VoiceEngineBridge>;
  getState: () => VoiceSessionState;
  onState: (state: VoiceSessionState) => void;
  onError: (error: VoiceSessionError) => void;
  onInterimTranscript: (text: string) => void;
  bargeIn: () => void;
};

/**
 * Hands-free Realtime engine: streams PCM16 to the verified gateway contract,
 * owns commit timing, and plays provider audio through the shared queue.
 */
export const useVoiceRealtimeEngine = ({
  stream,
  config,
  bridge,
  getState,
  onState,
  onError,
  onInterimTranscript,
  bargeIn,
}: UseVoiceRealtimeEngineParams) => {
  const aui = useAui();
  const isPlaying = useVoicePlaybackStore((state) => state.isPlaying);
  const latestRef = useRef({
    getState,
    onState,
    onError,
    onInterimTranscript,
    bargeIn,
    aui,
    config,
  });
  latestRef.current = { getState, onState, onError, onInterimTranscript, bargeIn, aui, config };

  const disposedRef = useRef(false);
  const turnCompleteRef = useRef(false);
  const interimBufferRef = useRef("");
  const ringRef = useRef<Float32Array[]>([]);
  const ringSamplesRef = useRef(0);
  const chunkRef = useRef<Float32Array[]>([]);
  const chunkSamplesRef = useRef(0);
  const chunkRateRef = useRef(48000);
  const streamingRef = useRef(false);

  const clearInterim = useCallback(() => {
    interimBufferRef.current = "";
    latestRef.current.onInterimTranscript("");
  }, []);

  const handleFrame = useCallback(
    (frame: RealtimeServerFrame) => {
      if (disposedRef.current) return;
      const current = latestRef.current;

      if (frame.type === "session.ready") {
        if (current.getState() !== "speaking") current.onState("listening");
        return;
      }

      if (frame.type === "output_audio_chunk") {
        try {
          const samples = decodePcm16Base64(frame.audio_base64);
          useVoicePlaybackStore.getState().enqueue(REALTIME_SPEECH_KEY, [
            {
              id: crypto.randomUUID(),
              audio: encodeWavBase64(samples, frame.sample_rate || 24000),
              mimeType: "audio/wav",
            },
          ]);
        } catch (audioError) {
          console.error("Realtime voice audio playback failed:", audioError);
        }
        return;
      }

      if (frame.type === "transcript.delta") {
        if (!frame.final) {
          if (!frame.text || turnCompleteRef.current) return;
          interimBufferRef.current += frame.text;
          current.onInterimTranscript(interimBufferRef.current);
          return;
        }
        const finalText = frame.text.trim();
        if (finalText && !turnCompleteRef.current) {
          current.aui.thread.append({
            role: "assistant",
            content: [{ type: "text", text: finalText }],
            startRun: false,
          });
          turnCompleteRef.current = true;
          if (!useVoicePlaybackStore.getState().isPlaying) current.onState("listening");
        }
        clearInterim();
        return;
      }

      if (frame.type === "session.closed") {
        if (current.getState() === "idle") return;
        clearInterim();
        current.onError({
          kind: "realtime-blocking",
          message: resolveRealtimeUnavailableMessage(
            current.config.realtime.provider,
            current.config.realtime.model,
          ),
        });
        return;
      }

      if (frame.type === "error" && !frame.retryable) {
        clearInterim();
        current.onError({
          kind: "realtime-blocking",
          message: resolveRealtimeUnavailableMessage(
            current.config.realtime.provider,
            current.config.realtime.model,
          ),
        });
      }
    },
    [clearInterim],
  );

  const realtime = useRealtimeVoiceSession({
    provider: config.realtime.provider,
    model: config.realtime.model,
    credentialName: config.realtime.credentialName,
    mode: "realtime",
    voice: config.realtime.voice,
    language: config.realtime.language,
    spaceId: getStudioSpaceId(),
    envType: getStudioEnvHeaders()["X-Env-Type"],
    onFrame: handleFrame,
  });

  const { connect, disconnect, stop, sendAudioChunk, status } = realtime;

  useEffect(() => {
    disposedRef.current = false;
    connect();
    return () => {
      disposedRef.current = true;
      clearInterim();
      stop();
      disconnect();
    };
  }, [clearInterim, connect, disconnect, stop]);

  useEffect(() => {
    if (status === "connecting") {
      if (getState() !== "connecting") onState("connecting");
      return;
    }
    if (status === "reconnecting") {
      onState("reconnecting");
      return;
    }
    if (status === "active") {
      if (!isPlaying && getState() !== "speaking") onState("listening");
      return;
    }
    if (status === "blocked") {
      clearInterim();
      onError({
        kind: "realtime-blocking",
        message: resolveRealtimeUnavailableMessage(config.realtime.provider, config.realtime.model),
      });
    }
  }, [
    clearInterim,
    config.realtime.model,
    config.realtime.provider,
    getState,
    isPlaying,
    onError,
    onState,
    status,
  ]);

  const flushChunk = useCallback(
    (commit: boolean) => {
      const frames = chunkRef.current;
      const total = chunkSamplesRef.current;
      if (total === 0 && !commit) return;

      const merged = new Float32Array(total === 0 ? 1600 : total);
      let offset = 0;
      frames.forEach((frame) => {
        merged.set(frame, offset);
        offset += frame.length;
      });
      chunkRef.current = [];
      chunkSamplesRef.current = 0;

      sendAudioChunk(encodePcm16Base64(merged, chunkRateRef.current), commit);
    },
    [sendAudioChunk],
  );

  useEffect(() => {
    const capture = new VoiceActivityCapture();
    capture.start(stream, {
      onFrame: (samples, sampleRate) => {
        chunkRateRef.current = sampleRate;
        if (!streamingRef.current) {
          ringRef.current.push(samples);
          ringSamplesRef.current += samples.length;
          const maxSamples = (sampleRate * VOICE_VAD_DEFAULTS.preRollMs) / 1000;
          while (ringSamplesRef.current > maxSamples && ringRef.current.length > 1) {
            ringSamplesRef.current -= (ringRef.current.shift() as Float32Array).length;
          }
          return;
        }

        chunkRef.current.push(samples);
        chunkSamplesRef.current += samples.length;
        if (chunkSamplesRef.current >= (sampleRate * REALTIME_CHUNK_MS) / 1000) {
          flushChunk(false);
        }
      },
      onSpeechStart: () => {
        const current = latestRef.current;
        if (current.getState() === "speaking") current.bargeIn();
        clearInterim();
        streamingRef.current = true;
        turnCompleteRef.current = false;
        chunkRef.current = [...ringRef.current];
        chunkSamplesRef.current = ringSamplesRef.current;
        ringRef.current = [];
        ringSamplesRef.current = 0;
      },
      onSpeechEnd: (utterance) => {
        streamingRef.current = false;
        if (utterance.durationMs < VOICE_VAD_DEFAULTS.minUtteranceMs) {
          chunkRef.current = [];
          chunkSamplesRef.current = 0;
          return;
        }
        flushChunk(true);
        latestRef.current.onState("processing");
      },
    });

    return () => {
      capture.stop();
      streamingRef.current = false;
      ringRef.current = [];
      ringSamplesRef.current = 0;
      chunkRef.current = [];
      chunkSamplesRef.current = 0;
    };
  }, [clearInterim, flushChunk, stream]);

  useEffect(() => {
    const engineBridge = bridge.current;
    engineBridge.retryConnection = () => {
      connect();
    };

    return () => {
      engineBridge.retryConnection = undefined;
    };
  }, [bridge, connect]);

  useEffect(() => {
    if (!isPlaying) return;
    onState("speaking");
  }, [isPlaying, onState]);

  useEffect(() => {
    if (isPlaying || !turnCompleteRef.current) return;
    if (getState() === "speaking") onState("listening");
  }, [getState, isPlaying, onState]);
};

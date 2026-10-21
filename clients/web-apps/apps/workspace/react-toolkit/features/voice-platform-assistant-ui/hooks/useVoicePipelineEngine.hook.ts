import { useAui } from "@assistant-ui/react";
import { type MutableRefObject, useEffect, useRef } from "react";

import { transcribeSpeechToText } from "../apis/voice.apis";
import { encodeWavBlob } from "../utils/realtime-audio.util";
import { isNetworkRequestFailure } from "../utils/voice-controls.util";
import {
  VOICE_VAD_DEFAULTS,
  type VoiceSessionError,
  type VoiceSessionState,
  createSttRequestDto,
} from "../utils/voice-session.util";
import { VoiceActivityCapture, type VoiceUtterance } from "../utils/voice-vad.util";
import { fileToDataUrl } from "../utils/file-to-data-url.util";
import type { VoiceEngineBridge, VoiceSessionConfig } from "./useVoiceSession.hook";

type UseVoicePipelineEngineParams = {
  stream: MediaStream;
  config: VoiceSessionConfig;
  bridge: MutableRefObject<VoiceEngineBridge>;
  refId: string;
  refName: string;
  agentName: string | null;
  getState: () => VoiceSessionState;
  onState: (state: VoiceSessionState) => void;
  onError: (error: VoiceSessionError) => void;
  bargeIn: () => void;
};

/**
 * Hands-free Pipeline engine: browser VAD commits an utterance, STT feeds the
 * assistant run, and the shared speech queue plays the reply.
 */
export const useVoicePipelineEngine = ({
  stream,
  config,
  bridge,
  refId,
  refName,
  agentName,
  getState,
  onState,
  onError,
  bargeIn,
}: UseVoicePipelineEngineParams) => {
  const aui = useAui();
  const lastUtteranceRef = useRef<VoiceUtterance | null>(null);
  const abortRef = useRef<AbortController | null>(null);
  const latestRef = useRef({
    config,
    refId,
    refName,
    agentName,
    getState,
    onState,
    onError,
    bargeIn,
    aui,
  });
  latestRef.current = {
    config,
    refId,
    refName,
    agentName,
    getState,
    onState,
    onError,
    bargeIn,
    aui,
  };

  const transcribeRef = useRef<(utterance: VoiceUtterance) => Promise<void>>(async () => {});

  transcribeRef.current = async (utterance) => {
    const current = latestRef.current;
    const sttConfig = current.config.sttConfig;
    if (!sttConfig?.model) return;

    abortRef.current?.abort();
    const controller = new AbortController();
    abortRef.current = controller;

    try {
      const blob = encodeWavBlob(utterance.samples, utterance.sampleRate);
      const input = await fileToDataUrl(blob);
      const response = await transcribeSpeechToText(
        createSttRequestDto({
          input,
          audioFormat: "audio/wav",
          sttConfig,
          language: current.config.voiceConfig?.language ?? null,
          refId: current.refId,
          refName: current.refName,
          agentName: current.agentName,
        }),
      );
      if (controller.signal.aborted) return;

      const transcript = response.output?.trim();
      if (!transcript) {
        current.onError({
          kind: "stt",
          message: response.error ?? "No speech was detected.",
        });
        current.onState("listening");
        return;
      }
      current.aui.thread.append({ role: "user", content: [{ type: "text", text: transcript }] });
    } catch (error) {
      if (controller.signal.aborted) return;
      console.error("Voice session transcription failed:", error);
      current.onError(
        isNetworkRequestFailure(error)
          ? {
              kind: "network",
              message:
                "Could not reach the speech service. Check your connection, then retry transcription.",
            }
          : { kind: "stt", message: "Could not transcribe the recording. Try again." },
      );
      current.onState("listening");
    }
  };

  useEffect(() => {
    const capture = new VoiceActivityCapture();
    capture.start(stream, {
      onSpeechStart: () => {
        const current = latestRef.current;
        if (current.getState() === "speaking") current.bargeIn();
      },
      onSpeechEnd: (utterance) => {
        if (utterance.durationMs < VOICE_VAD_DEFAULTS.minUtteranceMs) return;
        lastUtteranceRef.current = utterance;
        latestRef.current.onState("processing");
        transcribeRef.current(utterance).catch(() => undefined);
      },
    });

    return () => {
      abortRef.current?.abort();
      abortRef.current = null;
      capture.stop();
    };
  }, [stream]);

  useEffect(() => {
    const engineBridge = bridge.current;
    engineBridge.retryTranscription = () => {
      const utterance = lastUtteranceRef.current;
      if (utterance) void transcribeRef.current(utterance);
    };
    engineBridge.retryReply = () => {
      const messages = aui.thread.getState().messages;
      const lastUser = [...messages].reverse().find((message) => message.role === "user");
      aui.thread.startRun({ parentId: lastUser?.id ?? null });
    };

    return () => {
      engineBridge.retryTranscription = undefined;
      engineBridge.retryReply = undefined;
    };
  }, [aui, bridge]);
};

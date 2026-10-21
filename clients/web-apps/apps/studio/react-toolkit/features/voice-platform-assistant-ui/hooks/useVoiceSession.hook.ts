import { useAui, useAuiState } from "@assistant-ui/react";
import { useCallback, useEffect, useMemo, useRef, useState } from "react";

import { useReactFlowExtStore } from "@/stores/react-flow-ext-store";
import { ModelConfigType, VoiceConfigType } from "@/types/model-config-type";

import { useVoicePlaybackStore } from "../stores/voice-playback.store";
import { resolveMissingSpeechConfigReason } from "../utils/voice-controls.util";
import {
  type RealtimeVoiceSettings,
  getRealtimeVoiceSettings,
  getVoiceAgentPlaygroundInputs,
} from "../utils/voice-playground-info.util";
import {
  type VoiceEngine,
  type VoiceSessionError,
  type VoiceSessionState,
  resolveMicrophoneError,
  resolveRealtimeUnavailableMessage,
  resolveVoiceEngine,
} from "../utils/voice-session.util";

export type VoiceSessionConfig = {
  engine: VoiceEngine;
  sttConfig: ModelConfigType | null;
  ttsConfig: ModelConfigType | null;
  voiceConfig: VoiceConfigType | null;
  realtime: RealtimeVoiceSettings;
};

export type VoiceEngineBridge = {
  retryTranscription?: () => void;
  retryReply?: () => void;
  retryConnection?: () => void;
};

type UseVoiceSessionParams = {
  sttConfig: ModelConfigType | null;
  ttsConfig: ModelConfigType | null;
  voiceConfig: VoiceConfigType | null;
  setSpeakReplies: (value: boolean) => void;
  abortLiveSynthesis: () => void;
  isSynthesizing: boolean;
  onSessionEnded?: () => void;
};

/**
 * Owns the Start/End voice session, its state machine, and strict engine
 * selection; engine modules perform the transport work.
 */
export const useVoiceSession = ({
  sttConfig,
  ttsConfig,
  voiceConfig,
  setSpeakReplies,
  abortLiveSynthesis,
  isSynthesizing,
  onSessionEnded,
}: UseVoiceSessionParams) => {
  const aui = useAui();
  const nodes = useReactFlowExtStore((state) => state.nodes);
  const configuredEngine = useMemo(
    () => resolveVoiceEngine(getVoiceAgentPlaygroundInputs(nodes)),
    [nodes],
  );
  const isPlaying = useVoicePlaybackStore((state) => state.isPlaying);
  const isRunActive = useAuiState((state) => state.thread.isRunning);
  const lastAssistantState = useAuiState((state) => {
    const last = state.thread.messages.at(-1);
    if (!last || last.role !== "assistant") return "none";
    return last.status.type === "incomplete"
      ? `incomplete:${last.status.reason}`
      : last.status.type;
  });

  const [engine, setEngine] = useState<VoiceEngine>("pipeline");
  const [sessionState, setSessionState] = useState<VoiceSessionState>("idle");
  const [sessionError, setSessionError] = useState<VoiceSessionError | null>(null);
  const [sessionId, setSessionId] = useState("idle");
  const [isActive, setIsActive] = useState(false);
  const [micStream, setMicStream] = useState<MediaStream | null>(null);
  const [config, setConfig] = useState<VoiceSessionConfig | null>(null);
  const [pipelineSwitchOffered, setPipelineSwitchOffered] = useState(false);

  const streamRef = useRef<MediaStream | null>(null);
  const mountedRef = useRef(true);
  const priorSpeakRepliesRef = useRef<boolean | null>(null);
  const stateRef = useRef<VoiceSessionState>(sessionState);
  const activeRef = useRef(isActive);
  const engineActionsRef = useRef<VoiceEngineBridge>({});
  stateRef.current = sessionState;
  activeRef.current = isActive;

  const stopStream = useCallback(() => {
    streamRef.current?.getTracks().forEach((track) => track.stop());
    streamRef.current = null;
    setMicStream(null);
  }, []);

  const restoreSpeakReplies = useCallback(() => {
    const prior = priorSpeakRepliesRef.current;
    if (prior === null) return;
    priorSpeakRepliesRef.current = null;
    setSpeakReplies(prior);
  }, [setSpeakReplies]);

  const startSession = useCallback(
    async (forcedEngine?: VoiceEngine) => {
      if (activeRef.current) return;

      setSessionError(null);
      setPipelineSwitchOffered(false);

      const inputs = getVoiceAgentPlaygroundInputs(useReactFlowExtStore.getState().nodes);
      const selectedEngine = forcedEngine ?? resolveVoiceEngine(inputs);
      const realtime = getRealtimeVoiceSettings(inputs);
      const nextConfig: VoiceSessionConfig = {
        engine: selectedEngine,
        sttConfig,
        ttsConfig,
        voiceConfig,
        realtime,
      };
      setEngine(selectedEngine);

      if (
        typeof navigator === "undefined" ||
        !navigator.mediaDevices?.getUserMedia ||
        typeof AudioContext === "undefined"
      ) {
        setSessionError({
          kind: "unsupported",
          message: "Voice sessions are not supported in this browser.",
        });
        setSessionState("idle");
        return;
      }

      if (selectedEngine === "pipeline") {
        const missingConfig =
          resolveMissingSpeechConfigReason(sttConfig, "recording") ??
          resolveMissingSpeechConfigReason(ttsConfig, "replies");
        if (missingConfig) {
          setSessionError({ kind: "unsupported", message: missingConfig });
          setSessionState("idle");
          return;
        }
      } else if (!realtime.provider || !realtime.model) {
        setSessionError({
          kind: "realtime-blocking",
          message: resolveRealtimeUnavailableMessage(realtime.provider, realtime.model),
        });
        setPipelineSwitchOffered(true);
        setSessionState("idle");
        return;
      }

      if (priorSpeakRepliesRef.current === null) {
        priorSpeakRepliesRef.current = useVoicePlaybackStore.getState().speakReplies;
      }
      setSpeakReplies(true);
      setSessionState("connecting");

      try {
        const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
        if (!mountedRef.current) {
          stream.getTracks().forEach((track) => track.stop());
          restoreSpeakReplies();
          return;
        }
        streamRef.current = stream;
        setMicStream(stream);
        setConfig(nextConfig);
        setSessionId(crypto.randomUUID());
        setIsActive(true);
        if (selectedEngine === "pipeline") setSessionState("listening");
      } catch (error) {
        console.error("Voice session microphone access failed:", error);
        stopStream();
        setSessionError(resolveMicrophoneError(error));
        setSessionState("idle");
        setIsActive(false);
        restoreSpeakReplies();
      }
    },
    [sttConfig, ttsConfig, voiceConfig, setSpeakReplies, stopStream, restoreSpeakReplies],
  );

  const endSession = useCallback(() => {
    activeRef.current = false;
    setIsActive(false);
    stopStream();
    useVoicePlaybackStore.getState().stop();
    abortLiveSynthesis();
    aui.thread.cancelRun();
    engineActionsRef.current = {};
    setConfig(null);
    setSessionState("idle");
    setSessionError(null);
    setPipelineSwitchOffered(false);
    restoreSpeakReplies();
    onSessionEnded?.();
  }, [abortLiveSynthesis, aui, onSessionEnded, stopStream, restoreSpeakReplies]);

  const switchToPipelineForSession = useCallback(() => {
    if (streamRef.current && config) {
      const switchedConfig: VoiceSessionConfig = { ...config, engine: "pipeline" };
      setConfig(switchedConfig);
      setEngine("pipeline");
      setSessionError(null);
      setPipelineSwitchOffered(false);
      setSessionState("listening");
      return;
    }
    setSessionError(null);
    setPipelineSwitchOffered(false);
    void startSession("pipeline");
  }, [config, startSession]);

  const getSessionState = useCallback(() => stateRef.current, []);

  const reportSessionState = useCallback((state: VoiceSessionState) => {
    if (!activeRef.current) return;
    setSessionState(state);
    if (state === "processing") {
      setSessionError((current) =>
        current && (current.kind === "stt" || current.kind === "network" || current.kind === "llm")
          ? null
          : current,
      );
    }
  }, []);

  const reportSessionError = useCallback((error: VoiceSessionError) => {
    if (!activeRef.current) return;
    setSessionError(error);
    if (error.kind === "realtime-blocking") setPipelineSwitchOffered(true);
  }, []);

  const retrySessionError = useCallback(() => {
    const kind = sessionError?.kind;
    if (!kind) return;
    if (kind === "mic-denied" || kind === "unsupported") {
      activeRef.current = false;
      void startSession();
      return;
    }
    if (kind === "stt" || kind === "network") {
      setSessionError(null);
      engineActionsRef.current.retryTranscription?.();
      return;
    }
    if (kind === "llm") {
      setSessionError(null);
      engineActionsRef.current.retryReply?.();
      return;
    }
    if (kind === "realtime-blocking") {
      setSessionError(null);
      setPipelineSwitchOffered(false);
      if (!activeRef.current) {
        void startSession();
        return;
      }
      setSessionState("connecting");
      engineActionsRef.current.retryConnection?.();
    }
  }, [sessionError, startSession]);

  useEffect(() => {
    if (!isActive) return;
    if (isPlaying) {
      if (stateRef.current !== "speaking") setSessionState("speaking");
      return;
    }
    if (engine === "pipeline" && (isRunActive || isSynthesizing)) {
      if (stateRef.current !== "processing") setSessionState("processing");
      return;
    }
    if (stateRef.current === "speaking") setSessionState("listening");
    else if (engine === "pipeline" && stateRef.current === "processing") {
      setSessionState("listening");
    }
  }, [engine, isActive, isPlaying, isRunActive, isSynthesizing]);

  useEffect(() => {
    if (!isActive || engine !== "pipeline") return;
    if (lastAssistantState === "incomplete:error") {
      setSessionError({
        kind: "llm",
        message: "The reply failed. Check your connection, then retry the reply.",
      });
    }
  }, [engine, isActive, lastAssistantState]);

  useEffect(() => {
    const handleOffline = () => {
      if (!activeRef.current) return;
      setSessionError({
        kind: "offline",
        message: "Connection lost — check your network, then retry.",
      });
    };
    const handleOnline = () => {
      setSessionError((current) => (current?.kind === "offline" ? null : current));
    };
    window.addEventListener("offline", handleOffline);
    window.addEventListener("online", handleOnline);
    return () => {
      window.removeEventListener("offline", handleOffline);
      window.removeEventListener("online", handleOnline);
    };
  }, []);

  useEffect(() => {
    mountedRef.current = true;
    return () => {
      mountedRef.current = false;
      activeRef.current = false;
      streamRef.current?.getTracks().forEach((track) => track.stop());
      streamRef.current = null;
      useVoicePlaybackStore.getState().stop();
      restoreSpeakReplies();
    };
  }, [restoreSpeakReplies]);

  return {
    isActive,
    engine,
    configuredEngine,
    sessionState,
    sessionError,
    sessionId,
    micStream,
    config,
    pipelineSwitchOffered,
    startSession: () => void startSession(),
    endSession,
    clearSessionError: () => setSessionError(null),
    retrySessionError,
    switchToPipelineForSession,
    reportSessionState,
    reportSessionError,
    getSessionState,
    engineActionsRef,
  };
};

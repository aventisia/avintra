import { useCallback, useEffect, useRef, useState } from "react";

import {
  REALTIME_RECONNECT_MAX_ATTEMPTS,
  classifyRealtimeClose,
  realtimeReconnectDelayMs,
  realtimeSessionErrorMessage,
  shouldSuggestPipelineSwitch,
} from "../utils/realtime-voice-session.util";

export type RealtimeSessionStatus =
  "idle" | "connecting" | "active" | "reconnecting" | "blocked" | "stopped";

export type RealtimeServerFrame =
  | { type: "session.ready"; provider: string; model: string; output_sample_rate: number }
  | { type: "output_audio_chunk"; audio_base64: string; sample_rate: number }
  | { type: "transcript.delta"; text: string; final: boolean; role?: "user" | "assistant" }
  | { type: "session.closed" }
  | { type: "error"; code: string; message: string; retryable: boolean };

type UseRealtimeVoiceSessionArgs = {
  provider: string;
  model: string;
  credentialName: string;
  mode: string;
  voice?: string;
  language?: string;
  spaceId?: string;
  envType?: string;
  onFrame?: (frame: RealtimeServerFrame) => void;
};

const realtimeSessionUrl = (spaceId?: string, envType?: string): string => {
  const base = import.meta.env.VITE_LLMPIPELINE_API_PATH ?? "";
  const path = `${base.replace(/\/$/, "")}/v2/llm/realtime/session`;
  const socketPath = path.startsWith("/") ? path : `/${path}`;
  const url = new URL(socketPath, window.location.origin);
  url.protocol = window.location.protocol === "https:" ? "wss:" : "ws:";
  if (spaceId) url.searchParams.set("space_id", spaceId);
  if (envType) url.searchParams.set("env_type", envType);
  return url.toString();
};

/**
 * Opens a cookie-authenticated realtime voice session and keeps it alive across
 * transient transport drops. Auth/config failures never retry and always surface
 * a blocking error; the engine mode is never switched automatically.
 */
export const useRealtimeVoiceSession = ({
  provider,
  model,
  credentialName,
  mode,
  voice,
  language,
  spaceId,
  envType,
  onFrame,
}: UseRealtimeVoiceSessionArgs) => {
  const socketRef = useRef<WebSocket | null>(null);
  const attemptRef = useRef(0);
  const closedByUserRef = useRef(false);
  const reconnectTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const [status, setStatus] = useState<RealtimeSessionStatus>("idle");
  const [error, setError] = useState<string | null>(null);
  const [pipelineSwitchSuggested, setPipelineSwitchSuggested] = useState(false);

  const sendStartFrame = useCallback(
    (socket: WebSocket) => {
      socket.send(
        JSON.stringify({
          type: "session.start",
          provider,
          model,
          credential_name: credentialName,
          voice: voice || undefined,
          language: language || undefined,
        }),
      );
    },
    [provider, model, credentialName, voice, language],
  );

  const connect = useCallback(() => {
    closedByUserRef.current = false;
    setError(null);
    setStatus(attemptRef.current > 0 ? "reconnecting" : "connecting");

    const socket = new WebSocket(realtimeSessionUrl(spaceId, envType));
    socketRef.current = socket;

    socket.onopen = () => {
      sendStartFrame(socket);
    };

    socket.onmessage = (event: MessageEvent<string>) => {
      let frame: RealtimeServerFrame;
      try {
        frame = JSON.parse(event.data) as RealtimeServerFrame;
      } catch {
        return;
      }

      if (frame.type === "session.ready") {
        attemptRef.current = 0;
        setStatus("active");
      }
      if (frame.type === "session.closed") {
        setStatus("stopped");
      }
      if (frame.type === "error" && !frame.retryable) {
        setError(frame.message);
      }

      onFrame?.(frame);
    };

    socket.onclose = (event: CloseEvent) => {
      if (closedByUserRef.current) {
        setStatus("stopped");
        return;
      }

      const disposition = classifyRealtimeClose(event.code);

      if (
        disposition === "silent-reconnect" &&
        attemptRef.current < REALTIME_RECONNECT_MAX_ATTEMPTS
      ) {
        attemptRef.current += 1;
        setStatus("reconnecting");
        reconnectTimerRef.current = setTimeout(
          connect,
          realtimeReconnectDelayMs(attemptRef.current),
        );
        return;
      }

      if (disposition === "stopped") {
        setStatus("stopped");
        return;
      }

      setStatus("blocked");
      setError(realtimeSessionErrorMessage({ code: event.code, provider, model, mode }));
      setPipelineSwitchSuggested(shouldSuggestPipelineSwitch("blocking"));
    };

    socket.onerror = () => {
      if (socketRef.current === socket) setStatus("reconnecting");
    };
  }, [envType, mode, model, onFrame, provider, sendStartFrame, spaceId]);

  const disconnect = useCallback(() => {
    closedByUserRef.current = true;
    if (reconnectTimerRef.current) clearTimeout(reconnectTimerRef.current);
    socketRef.current?.close();
    socketRef.current = null;
    setStatus("stopped");
  }, []);

  const stop = useCallback(() => {
    socketRef.current?.send(JSON.stringify({ type: "session.stop" }));
  }, []);

  const sendAudioChunk = useCallback((audioBase64: string, commit = false) => {
    socketRef.current?.send(
      JSON.stringify({
        type: "input_audio_chunk",
        audio_base64: audioBase64,
        sample_rate: 16000,
        commit,
      }),
    );
  }, []);

  useEffect(
    () => () => {
      closedByUserRef.current = true;
      if (reconnectTimerRef.current) clearTimeout(reconnectTimerRef.current);
      socketRef.current?.close();
    },
    [],
  );

  return {
    status,
    error,
    pipelineSwitchSuggested,
    isActive: status === "active",
    isReconnecting: status === "reconnecting",
    connect,
    disconnect,
    stop,
    sendAudioChunk,
  };
};

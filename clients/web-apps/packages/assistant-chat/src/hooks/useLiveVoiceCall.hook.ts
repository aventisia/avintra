import {
  type VoiceCallSnapshot,
  type VoiceSessionClient,
  type VoiceSessionClientOptions,
  type VoiceSessionMode,
  type VoiceSessionRequest,
  type VoiceSessionResponse,
  createVoiceCallSnapshot,
  toErrorMessage,
} from "@avplatform/voice-client";
import { useCallback, useEffect, useRef, useState } from "react";

import type { VoiceCallController } from "../types/voice-call.type";

type VoiceSessionClientConstructor = new (options: VoiceSessionClientOptions) => VoiceSessionClient;

export type UseLiveVoiceCallOptions = {
  flowVersionId: string;
  mode: VoiceSessionMode;
  prepare?: () => Promise<void>;
  createSession: (
    request: VoiceSessionRequest,
    signal: AbortSignal,
  ) => Promise<VoiceSessionResponse>;
  endSession?: (conversationId: string) => Promise<unknown>;
};

/** Runs one live voice call and mirrors the shared client's snapshot into React state. */
export const useLiveVoiceCall = ({
  flowVersionId,
  mode,
  prepare,
  createSession,
  endSession,
}: UseLiveVoiceCallOptions): VoiceCallController => {
  const [snapshot, setSnapshot] = useState<VoiceCallSnapshot>(createVoiceCallSnapshot);
  const clientRef = useRef<VoiceSessionClient | null>(null);
  const createSessionRef = useRef(createSession);
  const prepareRef = useRef(prepare);
  const endSessionRef = useRef(endSession);
  const startGenerationRef = useRef(0);

  createSessionRef.current = createSession;
  prepareRef.current = prepare;
  endSessionRef.current = endSession;

  const fail = useCallback((code: string, error: unknown, fallback: string) => {
    setSnapshot((current) => ({
      ...current,
      state: "error",
      isActive: false,
      error: { code, message: toErrorMessage(error, fallback), retryable: true },
    }));
  }, []);

  const start = useCallback(() => {
    const generation = ++startGenerationRef.current;

    void (async () => {
      const previousClient = clientRef.current;
      clientRef.current = null;
      // IMPORTANT NOTE: teardown starts synchronously and its microphone stop is
      // immediate; awaiting it would let one stalled leave block the next call.
      if (previousClient) void previousClient.dispose();

      let ClientConstructor: VoiceSessionClientConstructor;
      try {
        ({ VoiceSessionClient: ClientConstructor } = await import("@avplatform/voice-client"));
      } catch (error) {
        if (generation !== startGenerationRef.current) return;
        fail("client_unavailable", error, "The voice client could not be loaded.");
        return;
      }

      if (generation !== startGenerationRef.current) return;

      const client = new ClientConstructor({
        prepare: () => prepareRef.current?.() ?? Promise.resolve(),
        createSession: (request, signal) => createSessionRef.current(request, signal),
        endSession: (conversationId) =>
          endSessionRef.current?.(conversationId) ?? Promise.resolve(),
        onSnapshot: (next) => {
          if (generation !== startGenerationRef.current) return;
          setSnapshot(next);
        },
      });
      clientRef.current = client;

      try {
        await client.start({ flowVersionId, mode });
      } catch (error) {
        if (generation !== startGenerationRef.current) return;
        fail("session_failed", error, "The voice call could not be started.");
        if (clientRef.current === client) clientRef.current = null;
        await client.dispose();
      }
    })();
  }, [fail, flowVersionId, mode]);

  const end = useCallback(() => {
    // IMPORTANT NOTE: bumping the generation also cancels a start that is still
    // importing or saving the draft, so a ghost call cannot come online after end.
    startGenerationRef.current += 1;
    const client = clientRef.current;
    clientRef.current = null;

    setSnapshot((current) => ({
      ...current,
      state: "ended",
      isActive: false,
      isMuted: false,
      needsAudioResume: false,
    }));

    if (!client) return;

    void (async () => {
      await client.end();
      await client.dispose();
    })();
  }, []);

  const toggleMute = useCallback(() => {
    void clientRef.current?.toggleMute();
  }, []);

  const resumeAudio = useCallback(() => {
    void clientRef.current?.resumeAudio();
  }, []);

  useEffect(
    () => () => {
      startGenerationRef.current += 1;
      void clientRef.current?.dispose();
      clientRef.current = null;
    },
    [],
  );

  return { ...snapshot, start, end, toggleMute, resumeAudio };
};

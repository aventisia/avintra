import {
  type VoiceCallSnapshot,
  type VoiceCaptionTurn,
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
  createSession: (request: VoiceSessionRequest) => Promise<VoiceSessionResponse>;
  /** Turns shown before the worker sends its first event, e.g. the spoken introduction. */
  initialTurns?: VoiceCaptionTurn[] | (() => VoiceCaptionTurn[]);
};

/** Runs one live voice call and mirrors the shared client's snapshot into React state. */
export const useLiveVoiceCall = ({
  flowVersionId,
  mode,
  createSession,
  initialTurns,
}: UseLiveVoiceCallOptions): VoiceCallController => {
  const [snapshot, setSnapshot] = useState<VoiceCallSnapshot>(createVoiceCallSnapshot);
  const clientRef = useRef<VoiceSessionClient | null>(null);
  const createSessionRef = useRef(createSession);
  const initialTurnsRef = useRef(initialTurns);
  const startGenerationRef = useRef(0);

  createSessionRef.current = createSession;
  initialTurnsRef.current = initialTurns;

  const mergeInitialTurns = useCallback((turns: VoiceCaptionTurn[]): VoiceCaptionTurn[] => {
    const source = initialTurnsRef.current;
    const seed = typeof source === "function" ? source() : (source ?? []);
    if (seed.length === 0) return turns;

    const turnIds = new Set(turns.map((turn) => turn.id));
    return [...seed.filter((turn) => !turnIds.has(turn.id)), ...turns];
  }, []);

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
      if (previousClient) await previousClient.dispose();

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
        createSession: (request) => createSessionRef.current(request),
        onSnapshot: (next) => {
          if (generation !== startGenerationRef.current) return;
          setSnapshot({ ...next, turns: mergeInitialTurns(next.turns) });
        },
      });
      clientRef.current = client;

      try {
        await client.start({ flowVersionId, mode });
      } catch (error) {
        if (generation !== startGenerationRef.current) return;
        fail("session_failed", error, "The voice call could not be started.");
        await client.dispose();
      }
    })();
  }, [fail, flowVersionId, mergeInitialTurns, mode]);

  const end = useCallback(() => {
    const client = clientRef.current;
    if (!client) return;

    void (async () => {
      await client.end();
      if (clientRef.current === client) clientRef.current = null;
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

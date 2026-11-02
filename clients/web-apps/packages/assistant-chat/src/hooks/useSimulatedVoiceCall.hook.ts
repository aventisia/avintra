import { useCallback, useEffect, useMemo, useState } from "react";

import type { VoiceCallScriptTurn, VoiceCallState } from "../types/voice-call.type";
import { buildVoiceCallTimeline, getVoiceCallFrame } from "../utils/voice-call-timeline.util";

const TICK_MS = 100;

type CallPhase = "idle" | "active" | "ended";

/**
 * Plays a scripted voice call so screens can be reviewed without audio or a backend.
 * While muted, the caller's turns pause; the agent keeps talking.
 */
export const useSimulatedVoiceCall = (script: VoiceCallScriptTurn[]) => {
  const frames = useMemo(() => buildVoiceCallTimeline(script), [script]);
  const [phase, setPhase] = useState<CallPhase>("idle");
  const [scriptMs, setScriptMs] = useState(0);
  const [callMs, setCallMs] = useState(0);
  const [isMuted, setIsMuted] = useState(false);

  useEffect(() => {
    if (phase !== "active") return;

    const timer = window.setInterval(() => {
      setCallMs((ms) => ms + TICK_MS);
      setScriptMs((ms) => {
        const isCallerTurn = getVoiceCallFrame(frames, ms).state === "listening";
        return isMuted && isCallerTurn ? ms : ms + TICK_MS;
      });
    }, TICK_MS);

    return () => window.clearInterval(timer);
  }, [phase, frames, isMuted]);

  const start = useCallback(() => {
    setScriptMs(0);
    setCallMs(0);
    setIsMuted(false);
    setPhase("active");
  }, []);

  const end = useCallback(() => setPhase("ended"), []);
  const toggleMute = useCallback(() => setIsMuted((muted) => !muted), []);

  const frame = getVoiceCallFrame(frames, scriptMs);
  const state: VoiceCallState = phase === "active" ? frame.state : phase;

  return {
    state,
    isActive: phase === "active",
    turns: phase === "idle" ? [] : frame.turns,
    callMs,
    isMuted,
    start,
    end,
    toggleMute,
  };
};

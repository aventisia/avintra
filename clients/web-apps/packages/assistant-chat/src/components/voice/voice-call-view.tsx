import { Switch } from "@avplatform/ui";
import { Button } from "@avplatform/ui/buttons";
import { cn } from "@avplatform/ui/lib";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@avplatform/ui/select";
import { Mic, MicOff, Phone, PhoneOff } from "lucide-react";
import { type ReactNode, useEffect, useState } from "react";

import { useSimulatedVoiceCall } from "../../hooks/useSimulatedVoiceCall.hook";
import { VOICE_CALL_STATE_LABELS } from "../../lib/voice-call-labels";
import type { VoiceCallScriptTurn, VoiceCaptionTurn } from "../../types/voice-call.type";
import { playVoiceToolCue } from "../../utils/voice-tool-cue.util";
import { VoiceCaptions } from "./voice-captions";
import { VoiceLatencyStrip } from "./voice-latency-strip";
import { VoiceOrb } from "./voice-orb";

const SAMPLE_MICROPHONES = ["Default microphone", "Built-in microphone", "USB headset"];

const TEXT_ENTRY_SELECTOR =
  "input, textarea, select, button, [contenteditable='true'], [role='combobox']";

const formatCallTime = (ms: number) => {
  const totalSeconds = Math.floor(ms / 1000);
  return `${Math.floor(totalSeconds / 60)}:${String(totalSeconds % 60).padStart(2, "0")}`;
};

const findRunningToolKey = (turn?: VoiceCaptionTurn) => {
  const tool = turn?.toolCalls?.find((call) => call.isRunning);
  return tool && turn ? `${turn.id}:${tool.name}` : null;
};

const findLastLatency = (turns: VoiceCaptionTurn[]) =>
  [...turns].reverse().find((turn) => turn.latency)?.latency;

/** Toggles mute with Space unless focus is on a control that already uses the key. */
const useSpaceToMute = (isActive: boolean, toggleMute: () => void) => {
  useEffect(() => {
    if (!isActive) return;

    const onKeyDown = (event: KeyboardEvent) => {
      if (event.code !== "Space" || event.repeat) return;
      if (event.target instanceof Element && event.target.closest(TEXT_ENTRY_SELECTOR)) return;
      event.preventDefault();
      toggleMute();
    };

    window.addEventListener("keydown", onKeyDown);
    return () => window.removeEventListener("keydown", onKeyDown);
  }, [isActive, toggleMute]);
};

export type VoiceCallViewProps = {
  script: VoiceCallScriptTurn[];
  agentName: string;
  /** `panel` is the Studio test console; `full` is the Workspace call screen. */
  variant?: "panel" | "full";
  header?: ReactNode;
  idleTitle?: string;
  idleDescription?: string;
  /** Shows per-turn timing, the microphone picker, and the tool-call sound switch. */
  showDiagnostics?: boolean;
  /** Runs before each call starts, e.g. to save pending settings. */
  onStart?: () => void;
  className?: string;
};

/** Simulated voice call screen: orb, live captions, and call controls. */
export const VoiceCallView = ({
  script,
  agentName,
  variant = "panel",
  header,
  idleTitle,
  idleDescription,
  showDiagnostics,
  onStart,
  className,
}: VoiceCallViewProps) => {
  const call = useSimulatedVoiceCall(script);
  const [microphone, setMicrophone] = useState(SAMPLE_MICROPHONES[0]);
  const [isToolCueOn, setIsToolCueOn] = useState(true);
  const isFull = variant === "full";

  const runningToolKey = findRunningToolKey(call.turns[call.turns.length - 1]);
  const lastLatency = findLastLatency(call.turns);
  const statusLabel =
    call.isMuted && call.state === "listening" ? "Muted" : VOICE_CALL_STATE_LABELS[call.state];

  useSpaceToMute(call.isActive, call.toggleMute);

  useEffect(() => {
    if (runningToolKey && isToolCueOn) playVoiceToolCue();
  }, [runningToolKey, isToolCueOn]);

  return (
    <section
      aria-label={`Voice call with ${agentName}`}
      className={cn("flex h-full min-h-0 flex-col", isFull ? "bg-bg" : "bg-surface", className)}
    >
      {header}

      <p className="sr-only" aria-live="polite">
        {statusLabel}
      </p>

      <div
        className={cn("flex min-h-0 flex-1 flex-col", isFull && "mx-auto w-full max-w-2xl px-4")}
      >
        <div
          className={cn(
            "flex flex-col items-center gap-3",
            isFull ? "pb-4 pt-8 sm:pt-12" : "border-b border-line px-4 pb-4 pt-6",
          )}
        >
          <VoiceOrb state={call.state} isMuted={call.isMuted} size={isFull ? "lg" : "md"} />
          <div className="flex flex-col items-center gap-0.5">
            <span className={cn("font-semibold text-ink", isFull ? "text-heading" : "text-body")}>
              {statusLabel}
            </span>
            {call.state !== "idle" && (
              <span className="font-mono text-[12px] tabular-nums text-muted-foreground">
                {formatCallTime(call.callMs)}
              </span>
            )}
          </div>
        </div>

        <div className={cn("min-h-0 flex-1 overflow-y-auto", isFull ? "py-4" : "px-4 py-4")}>
          {call.turns.length ? (
            <VoiceCaptions
              turns={call.turns}
              agentName={agentName}
              showLatency={showDiagnostics}
              size={isFull ? "lg" : "md"}
            />
          ) : (
            <div className="flex h-full flex-col items-center justify-center gap-1 px-6 text-center">
              {idleTitle && <p className="text-body font-semibold text-ink">{idleTitle}</p>}
              {idleDescription && (
                <p className="text-hint text-muted-foreground">{idleDescription}</p>
              )}
            </div>
          )}
        </div>

        {showDiagnostics && (
          <div className="flex flex-col gap-2 border-t border-line bg-sunken px-4 py-2.5">
            <div className="flex items-center justify-between gap-3">
              <span className="text-label uppercase text-muted-foreground">Last turn</span>
              {lastLatency ? (
                <VoiceLatencyStrip latency={lastLatency} />
              ) : (
                <span className="text-hint text-muted-foreground">
                  Timing shows after the first reply
                </span>
              )}
            </div>
            <div className="flex items-center justify-between gap-3">
              <Select value={microphone} onValueChange={setMicrophone}>
                <SelectTrigger aria-label="Microphone" className="h-7 w-48 text-[12.5px]">
                  <Mic
                    aria-hidden="true"
                    className="mr-1.5 size-3.5 shrink-0 text-muted-foreground"
                  />
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {SAMPLE_MICROPHONES.map((name) => (
                    <SelectItem key={name} value={name}>
                      {name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <label className="flex items-center gap-2 text-hint text-ink-2">
                <Switch size="sm" checked={isToolCueOn} onCheckedChange={setIsToolCueOn} />
                Tool-call sound
              </label>
            </div>
          </div>
        )}

        <div
          className={cn(
            "flex items-center justify-center gap-2",
            isFull
              ? "pb-[max(1.5rem,env(safe-area-inset-bottom))] pt-3"
              : "border-t border-line px-4 py-3",
          )}
        >
          {call.isActive ? (
            <>
              <Button
                variant="outline"
                size={isFull ? "lg" : "default"}
                aria-pressed={call.isMuted}
                onClick={call.toggleMute}
              >
                {call.isMuted ? (
                  <MicOff aria-hidden="true" className="mr-1.5 size-4" />
                ) : (
                  <Mic aria-hidden="true" className="mr-1.5 size-4" />
                )}
                {call.isMuted ? "Unmute" : "Mute"}
              </Button>
              <Button variant="destructive" size={isFull ? "lg" : "default"} onClick={call.end}>
                <PhoneOff aria-hidden="true" className="mr-1.5 size-4" />
                End call
              </Button>
              <span className="ml-2 hidden text-hint text-muted-foreground sm:inline">
                <kbd className="rounded-sm border border-line bg-sunken px-1 font-mono text-[11px]">
                  Space
                </kbd>{" "}
                to mute
              </span>
            </>
          ) : (
            <Button
              size={isFull ? "lg" : "default"}
              onClick={() => {
                onStart?.();
                call.start();
              }}
            >
              <Phone aria-hidden="true" className="mr-1.5 size-4" />
              {call.state === "ended" ? "Call again" : "Start call"}
            </Button>
          )}
        </div>
      </div>
    </section>
  );
};

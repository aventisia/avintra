import { cn } from "@avplatform/ui/lib";

import { VOICE_CALL_STATE_LABELS } from "../../lib/voice-call-labels";
import type { VoiceCallState } from "../../types/voice-call.type";

const HALO_STYLES: Record<VoiceCallState, string> = {
  idle: "border-line",
  connecting: "border-dashed border-line-strong animate-spin [animation-duration:3s]",
  listening: "border-live/60 animate-pulse",
  thinking: "border-dashed border-ink-2/50 animate-spin [animation-duration:2.4s]",
  speaking: "border-primary/40 bg-primary/10 animate-ping [animation-duration:1.6s]",
  ended: "border-line",
  error: "border-bad",
};

const CORE_STYLES: Record<VoiceCallState, string> = {
  idle: "bg-sunken",
  connecting: "bg-fill",
  listening: "bg-live/15 ring-2 ring-live",
  thinking: "bg-fill",
  speaking: "bg-primary shadow-[0_0_48px_-6px_var(--primary)]",
  ended: "bg-sunken",
  error: "bg-bad/15 ring-2 ring-bad",
};

export type VoiceOrbProps = {
  state: VoiceCallState;
  isMuted?: boolean;
  size?: "md" | "lg";
  className?: string;
};

/** Call-state orb: listening uses `live`, speaking uses `primary`, errors use `bad`. */
export const VoiceOrb = ({ state, isMuted, size = "md", className }: VoiceOrbProps) => (
  <div
    role="img"
    aria-label={isMuted ? "Microphone muted" : VOICE_CALL_STATE_LABELS[state]}
    className={cn(
      "relative grid shrink-0 place-items-center",
      size === "lg" ? "size-44 sm:size-56" : "size-28",
      className,
    )}
  >
    <span
      aria-hidden="true"
      className={cn(
        "absolute inset-0 rounded-full border-2 transition-colors motion-reduce:animate-none",
        HALO_STYLES[state],
      )}
    />
    <span
      aria-hidden="true"
      className={cn(
        "absolute inset-[16%] rounded-full transition-[background-color,box-shadow] duration-300 motion-reduce:transition-none",
        CORE_STYLES[state],
        isMuted && state === "listening" && "bg-fill ring-line-strong",
      )}
    />
  </div>
);

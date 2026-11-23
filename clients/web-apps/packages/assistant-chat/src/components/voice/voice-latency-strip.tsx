import { cn } from "@avplatform/ui/lib";
import { Tooltip } from "@avplatform/ui/tooltip";

import type { VoiceTurnLatency } from "../../types/voice-call.type";

const END_TO_END_TARGET_MS = 800;
const END_TO_END_SLOW_MS = 1500;

const endToEndTone = (ms: number) =>
  ms <= END_TO_END_TARGET_MS ? "text-ok" : ms <= END_TO_END_SLOW_MS ? "text-warn" : "text-bad";

const duration = (ms: number) =>
  ms < 1000 ? `${Math.round(ms)} ms` : `${(ms / 1000).toFixed(2)} s`;

type LatencyRow = {
  label: string;
  value: number | null;
  description: string;
  isClaim?: boolean;
};

const getRows = (latency: VoiceTurnLatency): LatencyRow[] => [
  {
    label: "STT",
    value: latency.speechToTextMs,
    description: "Final speech-to-text call duration.",
  },
  {
    label: "Endpointing",
    value: latency.endpointingMs,
    description: "Caller stopped speaking to final transcript.",
  },
  {
    label: "First token",
    value: latency.firstTokenMs,
    description: "Transcript ready to the model's first token.",
  },
  {
    label: "TTFT",
    value: latency.ttftMs,
    description: "Realtime model time to its first token.",
    isClaim: true,
  },
  {
    label: "First audio",
    value: latency.firstAudioMs,
    description: "Transcript ready to the first audio the caller hears.",
  },
  {
    label: "Response",
    value: latency.durationMs,
    description: "Full reply duration reported by the realtime model.",
  },
  {
    label: "Caller → speaking",
    value: latency.callerToSpeakingMs,
    description: "Caller stopped speaking to the agent speaking.",
    isClaim: true,
  },
];

export type VoiceLatencyStripProps = {
  latency: VoiceTurnLatency;
  className?: string;
};

/**
 * Per-turn timing by stage. The claim is caller speech end to first audio
 * (realtime has no caller-speech reference, so its TTFT stands in) against 800 ms.
 */
export const VoiceLatencyStrip = ({ latency, className }: VoiceLatencyStripProps) => {
  const rows = getRows(latency).filter(
    (row): row is LatencyRow & { value: number } => row.value !== null,
  );

  if (!rows.length) return null;

  return (
    <dl
      className={cn(
        "flex flex-wrap gap-x-3 gap-y-0.5 font-mono text-[11px]/4 text-muted-foreground",
        className,
      )}
    >
      {rows.map((row) => (
        <Tooltip key={row.label} content={row.description}>
          <div className="flex cursor-help gap-1">
            <dt>{row.label}</dt>
            <dd
              className={cn("text-ink-2", row.isClaim && ["font-medium", endToEndTone(row.value)])}
            >
              {duration(row.value)}
            </dd>
          </div>
        </Tooltip>
      ))}
    </dl>
  );
};

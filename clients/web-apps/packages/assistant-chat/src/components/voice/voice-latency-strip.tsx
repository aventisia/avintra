import { cn } from "@avplatform/ui/lib";

import type { VoiceTurnLatency } from "../../types/voice-call.type";

const END_TO_END_TARGET_MS = 800;
const END_TO_END_SLOW_MS = 1500;

const endToEndTone = (ms: number) =>
  ms <= END_TO_END_TARGET_MS ? "text-ok" : ms <= END_TO_END_SLOW_MS ? "text-warn" : "text-bad";

const milliseconds = (ms: number) => `${ms} ms`;
const seconds = (ms: number) => `${(ms / 1000).toFixed(1)} s`;

type LatencyRow = {
  label: string;
  value: number | null;
  format: (ms: number) => string;
  isClaim?: boolean;
};

const getRows = (latency: VoiceTurnLatency): LatencyRow[] => [
  { label: "STT", value: latency.speechToTextMs, format: milliseconds },
  { label: "Endpointing", value: latency.endpointingMs, format: milliseconds },
  { label: "First token", value: latency.firstTokenMs, format: milliseconds },
  { label: "TTFT", value: latency.ttftMs, format: milliseconds, isClaim: true },
  { label: "First audio", value: latency.firstAudioMs, format: seconds },
  { label: "Response", value: latency.durationMs, format: seconds },
  {
    label: "Caller → speaking",
    value: latency.callerToSpeakingMs,
    format: seconds,
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
        <div key={row.label} className="flex gap-1">
          <dt>{row.label}</dt>
          <dd
            className={cn(
              "text-ink-2",
              row.isClaim ? cn("font-medium", endToEndTone(row.value)) : undefined,
            )}
          >
            {row.format(row.value)}
          </dd>
        </div>
      ))}
    </dl>
  );
};

import { cn } from "@avplatform/ui/lib";

import type { VoiceTurnLatency } from "../../types/voice-call.type";

const FIRST_AUDIO_TARGET_MS = 1500;
const FIRST_AUDIO_SLOW_MS = 2500;

const firstAudioTone = (ms: number) =>
  ms <= FIRST_AUDIO_TARGET_MS ? "text-ok" : ms <= FIRST_AUDIO_SLOW_MS ? "text-warn" : "text-bad";

export type VoiceLatencyStripProps = {
  latency: VoiceTurnLatency;
  className?: string;
};

/** Per-turn timing: speech-to-text, first token, and first audio against the 1.5 s target. */
export const VoiceLatencyStrip = ({ latency, className }: VoiceLatencyStripProps) => (
  <dl
    className={cn(
      "flex flex-wrap gap-x-3 gap-y-0.5 font-mono text-[11px]/4 text-muted-foreground",
      className,
    )}
  >
    <div className="flex gap-1">
      <dt>STT</dt>
      <dd className="text-ink-2">{latency.speechToTextMs} ms</dd>
    </div>
    <div className="flex gap-1">
      <dt>First token</dt>
      <dd className="text-ink-2">{latency.firstTokenMs} ms</dd>
    </div>
    <div className="flex gap-1">
      <dt>First audio</dt>
      <dd className={cn("font-medium", firstAudioTone(latency.firstAudioMs))}>
        {(latency.firstAudioMs / 1000).toFixed(1)} s
      </dd>
    </div>
  </dl>
);

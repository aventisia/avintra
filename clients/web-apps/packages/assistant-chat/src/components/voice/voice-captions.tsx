import { cn } from "@avplatform/ui/lib";
import { CircleNotchIcon, SparkleIcon, WrenchIcon } from "@phosphor-icons/react";
import { useEffect, useRef } from "react";

import type { VoiceCaptionTurn, VoiceToolCall } from "../../types/voice-call.type";
import { VoiceLatencyStrip } from "./voice-latency-strip";

const VoiceToolChip = ({ tool }: { tool: VoiceToolCall }) => (
  <span className="inline-flex h-6 items-center gap-1.5 rounded-sm border border-line bg-sunken px-2 font-mono text-[11.5px] text-ink-2">
    {tool.isRunning ? (
      <CircleNotchIcon
        aria-hidden="true"
        className="size-3 animate-spin text-live motion-reduce:animate-none"
      />
    ) : (
      <WrenchIcon aria-hidden="true" className="size-3 text-muted-foreground" />
    )}
    {tool.name}
    <span className="text-muted-foreground">
      {tool.isRunning
        ? "running…"
        : tool.durationMs !== undefined
          ? `${tool.durationMs} ms`
          : "called"}
    </span>
  </span>
);

const VoiceSkillChip = ({ name }: { name: string }) => (
  <span className="inline-flex h-6 items-center gap-1.5 rounded-sm border border-line bg-sunken px-2 text-[11.5px] text-ink-2">
    <SparkleIcon aria-hidden="true" className="size-3 text-muted-foreground" />
    Using skill: {name}
  </span>
);

export type VoiceCaptionsProps = {
  turns: VoiceCaptionTurn[];
  agentName?: string;
  callerName?: string;
  showLatency?: boolean;
  size?: "md" | "lg";
  className?: string;
};

/** Live captions; caller words still being transcribed render in italics. */
export const VoiceCaptions = ({
  turns,
  agentName = "Agent",
  callerName = "You",
  showLatency,
  size = "md",
  className,
}: VoiceCaptionsProps) => {
  const endRef = useRef<HTMLDivElement>(null);
  const lastTurn = turns[turns.length - 1];

  useEffect(() => {
    endRef.current?.scrollIntoView({ block: "nearest" });
  }, [turns.length, lastTurn?.text, lastTurn?.toolCalls?.length, lastTurn?.skillCalls?.length]);

  return (
    <div className={cn("flex flex-col gap-4", className)}>
      {turns.map((turn) => (
        <div key={turn.id} className="flex flex-col gap-1.5">
          <span
            className={cn(
              "text-label uppercase",
              turn.speaker === "agent" ? "text-primary-text" : "text-muted-foreground",
            )}
          >
            {turn.speaker === "agent" ? agentName : callerName}
          </span>

          {turn.skillCalls?.length ? (
            <div className="flex flex-wrap gap-1.5">
              {turn.skillCalls.map((skill, index) => (
                <VoiceSkillChip key={`${skill}-${index}`} name={skill} />
              ))}
            </div>
          ) : null}

          {turn.toolCalls?.length ? (
            <div className="flex flex-wrap gap-1.5">
              {turn.toolCalls.map((tool, index) => (
                <VoiceToolChip key={`${tool.name}-${index}`} tool={tool} />
              ))}
            </div>
          ) : null}

          {turn.text ? (
            <p
              className={cn(
                size === "lg" ? "text-[17px]/7 sm:text-[19px]/8" : "text-body",
                turn.isInterim ? "italic text-muted-foreground" : "text-ink",
              )}
            >
              {turn.text}
            </p>
          ) : null}

          {showLatency && turn.latency ? <VoiceLatencyStrip latency={turn.latency} /> : null}
        </div>
      ))}
      <div ref={endRef} />
    </div>
  );
};

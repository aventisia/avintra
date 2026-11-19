import { VoiceCaptions } from "@avplatform/assistant-chat";
import type { VoiceCaptionTurn } from "@avplatform/assistant-chat";
import { EmptyState } from "@avplatform/ui";
import { Badge } from "@avplatform/ui/badge";
import { Button } from "@avplatform/ui/buttons";
import { cn } from "@avplatform/ui/lib";
import { ScrollArea } from "@avplatform/ui/scroll";
import { PhoneCallIcon, WarningIcon } from "@phosphor-icons/react";
import { useMemo, useState } from "react";

import {
  DayTimeline,
  DayTimelineCount,
  DayTimelineEntry,
  DayTimelineItem,
  DayTimelineSection,
  DayTimelineSkeleton,
} from "@/components/day-timeline";
import { DetailPaneHeader } from "@/components/panel/components/DetailPaneHeader";
import {
  LEFT_DOCK_PANEL_WIDTH,
  LEFT_DOCK_TITLE_CLASS,
} from "@/components/panel/left-dock-panel.constant";
import { useFetchFlowToLoad } from "@/features/react-flow/hooks/useFetchFlowToLoad";
import { useCurrentFlowStore } from "@/stores/current-flow-store";

import {
  useVoiceConversationTurns,
  useVoiceConversations,
} from "../hooks/useVoiceConversations.hook";
import type {
  VoiceConversationDay,
  VoiceConversationOutcome,
  VoiceConversationSummary,
} from "../types/voice-conversation.type";
import { groupConversationsByDay } from "../utils/voice-conversation.util";

const OUTCOMES: Record<
  VoiceConversationOutcome,
  { label: string; variant: "completed" | "running" | "failed"; text: string; marker: string }
> = {
  completed: {
    label: "Completed",
    variant: "completed",
    text: "text-ok",
    marker: "rounded-full bg-current",
  },
  active: {
    label: "In progress",
    variant: "running",
    text: "text-live",
    marker: "size-2 rounded-full border-[1.5px] border-current",
  },
  error: {
    label: "Error",
    variant: "failed",
    text: "text-bad",
    marker: "rounded-[1px] bg-current",
  },
};

const formatDuration = (ms: number) => {
  const totalSeconds = Math.round(ms / 1000);
  return `${Math.floor(totalSeconds / 60)}:${String(totalSeconds % 60).padStart(2, "0")}`;
};

const formatTime = (iso: string) => {
  const date = new Date(iso);
  return Number.isNaN(date.getTime())
    ? "-"
    : date.toLocaleTimeString(undefined, { hour: "2-digit", minute: "2-digit" });
};

const formatStartedAt = (iso: string) => {
  const date = new Date(iso);
  return Number.isNaN(date.getTime())
    ? "-"
    : date.toLocaleString(undefined, { dateStyle: "medium", timeStyle: "short" });
};

const getAverageFirstAudio = (turns: VoiceCaptionTurn[]) => {
  const timings = turns.flatMap((turn) => {
    const firstAudioMs = turn.latency?.firstAudioMs;
    return firstAudioMs != null ? [firstAudioMs] : [];
  });
  if (!timings.length) return "-";
  return `${(timings.reduce((sum, ms) => sum + ms, 0) / timings.length / 1000).toFixed(1)} s`;
};

const getToolCount = (turns: VoiceCaptionTurn[]) =>
  turns.reduce((count, turn) => count + (turn.toolCalls?.length ?? 0), 0);

const CallLog = ({
  days,
  selectedId,
  onSelect,
}: {
  days: VoiceConversationDay[];
  selectedId?: string;
  onSelect: (id: string) => void;
}) => {
  return (
    <DayTimeline days={days} selectedId={selectedId}>
      {days.map((day, index) => {
        const errorCount = day.entries.filter((entry) => entry.outcome === "error").length;
        return (
          <DayTimelineSection
            key={day.date}
            day={day.date}
            startedAt={day.startedAt}
            isFirst={index === 0}
            isLast={index === days.length - 1}
            meta={
              <>
                {errorCount > 0 ? (
                  <span className="rounded-full bg-bad/10 px-1.5 py-px text-2xs font-medium tabular-nums text-bad">
                    {errorCount} {errorCount === 1 ? "error" : "errors"}
                  </span>
                ) : null}
                <DayTimelineCount count={day.entries.length} noun="call" />
              </>
            }
          >
            {day.entries.map((conversation) => {
              const outcome = OUTCOMES[conversation.outcome];
              return (
                <DayTimelineItem key={conversation.id}>
                  <DayTimelineEntry
                    isSelected={conversation.id === selectedId}
                    onSelect={() => onSelect(conversation.id)}
                    markerClassName={cn(outcome.marker, outcome.text)}
                    title={formatTime(conversation.startedAt)}
                    aside={formatDuration(conversation.durationMs)}
                    subtitle={
                      <>
                        <span className={cn("shrink-0 font-medium", outcome.text)}>
                          {outcome.label}
                        </span>
                        <span aria-hidden="true" className="text-line-strong">
                          ·
                        </span>
                        <span className="truncate text-muted-foreground" title={conversation.title}>
                          {conversation.title}
                        </span>
                      </>
                    }
                  />
                </DayTimelineItem>
              );
            })}
          </DayTimelineSection>
        );
      })}
    </DayTimeline>
  );
};

const ConversationDetail = ({
  conversation,
  turns,
  isLoadingTurns,
  isTurnsError,
  agentName,
}: {
  conversation: VoiceConversationSummary;
  turns: VoiceCaptionTurn[];
  isLoadingTurns: boolean;
  isTurnsError: boolean;
  agentName: string;
}) => {
  const outcome = OUTCOMES[conversation.outcome];
  const stats = [
    { label: "Duration", value: formatDuration(conversation.durationMs) },
    { label: "Turns", value: String(turns.length) },
    { label: "Avg first audio", value: getAverageFirstAudio(turns) },
    { label: "Tool calls", value: String(getToolCount(turns)) },
  ];

  return (
    <div className="flex min-h-0 flex-1 flex-col">
      <DetailPaneHeader
        Icon={PhoneCallIcon}
        eyebrow={formatStartedAt(conversation.startedAt)}
        title={conversation.title}
        aside={<Badge variant={outcome.variant}>{outcome.label}</Badge>}
      />

      <dl className="grid shrink-0 grid-cols-2 border-b border-line md:grid-cols-4">
        {stats.map((stat) => (
          <div key={stat.label} className="border-line px-6 py-3 [&:not(:last-child)]:md:border-r">
            <dt className="font-mono text-label uppercase text-muted-foreground">{stat.label}</dt>
            <dd className="font-mono text-body-sm tabular-nums text-ink">{stat.value}</dd>
          </div>
        ))}
      </dl>

      <ScrollArea className="min-h-0 flex-1">
        <div className="mx-auto flex max-w-2xl flex-col gap-4 px-6 py-5">
          {isLoadingTurns ? (
            <p className="text-body-sm text-muted-foreground">Loading transcript…</p>
          ) : isTurnsError ? (
            <p className="text-body-sm text-bad">The transcript could not be loaded.</p>
          ) : turns.length ? (
            <VoiceCaptions turns={turns} agentName={agentName} callerName="Caller" showLatency />
          ) : (
            <p className="text-body-sm text-muted-foreground">
              No transcript was recorded for this call.
            </p>
          )}
        </div>
      </ScrollArea>
    </div>
  );
};

/** Voice agent call log: calls grouped by day on the left, the selected call's transcript on the right. */
export const VoiceConversations = () => {
  useFetchFlowToLoad();
  const agentName = useCurrentFlowStore((state) => state.currentFlow.name) || "Agent";
  const flowVersionId = useCurrentFlowStore((state) => state.currentFlow.versionId);
  const {
    data: conversations = [],
    isLoading,
    isError,
    refetch,
  } = useVoiceConversations(flowVersionId);
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const days = useMemo(() => groupConversationsByDay(conversations), [conversations]);

  const selected =
    conversations.find((conversation) => conversation.id === selectedId) ?? days[0]?.entries[0];
  const {
    data: turns = [],
    isLoading: isLoadingTurns,
    isError: isTurnsError,
  } = useVoiceConversationTurns(selected?.id);

  return (
    <div className="flex h-full bg-surface">
      <aside
        aria-label="Call log"
        className={cn("flex shrink-0 flex-col border-r border-line", LEFT_DOCK_PANEL_WIDTH)}
      >
        <div className="flex h-12 shrink-0 items-center justify-between gap-2 border-b border-line pl-4 pr-2">
          <h1 className={cn("text-ink", LEFT_DOCK_TITLE_CLASS)}>Call log</h1>
          {conversations.length > 0 && (
            <DayTimelineCount count={conversations.length} noun="call" />
          )}
        </div>
        <ScrollArea className="min-h-0 flex-1">
          {isLoading ? (
            <DayTimelineSkeleton label="Loading calls" />
          ) : isError ? (
            <EmptyState
              Icon={WarningIcon}
              primaryMessage="Could not load calls"
              secondaryMessage="Something went wrong while fetching this version's calls."
              action={
                <Button size="sm" variant="outline" onClick={() => refetch()}>
                  Retry
                </Button>
              }
            />
          ) : conversations.length ? (
            <div className="pb-2">
              <CallLog days={days} selectedId={selected?.id} onSelect={setSelectedId} />
            </div>
          ) : (
            <EmptyState
              Icon={PhoneCallIcon}
              primaryMessage="No calls for this version"
              secondaryMessage="Start a test call to record the first one."
            />
          )}
        </ScrollArea>
      </aside>

      <main className="flex min-w-0 flex-1 flex-col">
        {selected ? (
          <ConversationDetail
            conversation={selected}
            turns={turns}
            isLoadingTurns={isLoadingTurns}
            isTurnsError={isTurnsError}
            agentName={agentName}
          />
        ) : (
          <EmptyState
            Icon={PhoneCallIcon}
            primaryMessage="Select a call"
            secondaryMessage="Its transcript, timing and tool calls appear here."
          />
        )}
      </main>
    </div>
  );
};

import { VoiceCaptions } from "@avplatform/assistant-chat";
import type { VoiceCaptionTurn } from "@avplatform/assistant-chat";
import { EmptyState } from "@avplatform/ui";
import { Badge } from "@avplatform/ui/badge";
import { Button } from "@avplatform/ui/buttons";
import { cn } from "@avplatform/ui/lib";
import { PhoneCall } from "lucide-react";
import { useState } from "react";

import { useFetchFlowToLoad } from "@/features/react-flow/hooks/useFetchFlowToLoad";
import { useCurrentFlowStore } from "@/stores/current-flow-store";

import {
  useVoiceConversationTurns,
  useVoiceConversations,
} from "../hooks/useVoiceConversations.hook";
import type {
  VoiceConversationOutcome,
  VoiceConversationSummary,
} from "../types/voice-conversation.type";

const OUTCOMES: Record<
  VoiceConversationOutcome,
  { label: string; variant: "completed" | "queued" | "failed" }
> = {
  completed: { label: "Completed", variant: "completed" },
  active: { label: "In progress", variant: "queued" },
  error: { label: "Error", variant: "failed" },
};

const formatDuration = (ms: number) => {
  const totalSeconds = Math.round(ms / 1000);
  return `${Math.floor(totalSeconds / 60)}:${String(totalSeconds % 60).padStart(2, "0")}`;
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

const ConversationRow = ({
  conversation,
  isSelected,
  onSelect,
}: {
  conversation: VoiceConversationSummary;
  isSelected: boolean;
  onSelect: () => void;
}) => (
  <button
    type="button"
    aria-current={isSelected}
    onClick={onSelect}
    className={cn(
      "flex w-full flex-col gap-1.5 border-b border-line px-4 py-3 text-left hover:bg-hover focus-visible:shadow-focus focus-visible:outline-none",
      isSelected && "bg-selected hover:bg-selected",
    )}
  >
    <div className="flex items-center justify-between gap-2">
      <span className="truncate text-body font-semibold text-ink" title={conversation.title}>
        {conversation.title}
      </span>
      <span className="shrink-0 font-mono text-[12px] tabular-nums text-muted-foreground">
        {formatDuration(conversation.durationMs)}
      </span>
    </div>
    <div className="flex items-center gap-1.5">
      <Badge variant={OUTCOMES[conversation.outcome].variant}>
        {OUTCOMES[conversation.outcome].label}
      </Badge>
      <span className="ml-auto text-hint text-muted-foreground">
        {formatStartedAt(conversation.startedAt)}
      </span>
    </div>
  </button>
);

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
  const stats = [
    { label: "Duration", value: formatDuration(conversation.durationMs) },
    { label: "Turns", value: String(turns.length) },
    { label: "Avg first audio", value: getAverageFirstAudio(turns) },
    { label: "Tool calls", value: String(getToolCount(turns)) },
  ];

  return (
    <div className="flex min-h-0 flex-1 flex-col">
      <div className="flex flex-col gap-3 border-b border-line px-6 py-4">
        <div className="flex flex-wrap items-center gap-2">
          <h2 className="min-w-0 truncate text-heading text-ink" title={conversation.title}>
            {conversation.title}
          </h2>
          <Badge variant={OUTCOMES[conversation.outcome].variant}>
            {OUTCOMES[conversation.outcome].label}
          </Badge>
          <span className="ml-auto text-hint text-muted-foreground">
            {formatStartedAt(conversation.startedAt)}
          </span>
        </div>
        <dl className="grid grid-cols-2 gap-2 md:grid-cols-4">
          {stats.map((stat) => (
            <div key={stat.label} className="rounded-lg bg-sunken px-3 py-2">
              <dt className="text-label uppercase text-muted-foreground">{stat.label}</dt>
              <dd className="font-mono text-body tabular-nums text-ink">{stat.value}</dd>
            </div>
          ))}
        </dl>
      </div>

      <div className="min-h-0 flex-1 overflow-y-auto px-6 py-5">
        <div className="mx-auto flex max-w-2xl flex-col gap-4">
          {isLoadingTurns ? (
            <p className="text-body-sm text-muted-foreground">Loading transcript…</p>
          ) : isTurnsError ? (
            <p className="text-body-sm text-destructive">The transcript could not be loaded.</p>
          ) : turns.length ? (
            <VoiceCaptions turns={turns} agentName={agentName} callerName="Caller" showLatency />
          ) : (
            <p className="text-body-sm text-muted-foreground">
              No transcript was recorded for this call.
            </p>
          )}
        </div>
      </div>
    </div>
  );
};

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

  const selected =
    conversations.find((conversation) => conversation.id === selectedId) ?? conversations[0];
  const {
    data: turns = [],
    isLoading: isLoadingTurns,
    isError: isTurnsError,
  } = useVoiceConversationTurns(selected?.id);

  return (
    <div className="flex h-full gap-1.5 bg-bg p-1.5">
      <aside className="flex w-[360px] shrink-0 flex-col overflow-hidden rounded-xl bg-surface">
        <div className="flex items-center gap-2 border-b border-line px-4 py-3">
          <h1 className="text-heading text-ink">Conversations</h1>
          {conversations.length > 0 && <Badge variant="secondary">{conversations.length}</Badge>}
        </div>
        <div className="min-h-0 flex-1 overflow-y-auto">
          {isLoading ? (
            <p className="px-4 py-6 text-hint text-muted-foreground">Loading conversations…</p>
          ) : isError ? (
            <div className="flex flex-col items-center gap-2 px-4 py-6 text-center">
              <p className="text-hint text-muted-foreground">Conversations could not be loaded.</p>
              <Button variant="outline" size="sm" onClick={() => void refetch()}>
                Try again
              </Button>
            </div>
          ) : conversations.length ? (
            conversations.map((conversation) => (
              <ConversationRow
                key={conversation.id}
                conversation={conversation}
                isSelected={conversation.id === selected?.id}
                onSelect={() => setSelectedId(conversation.id)}
              />
            ))
          ) : (
            <EmptyState
              Icon={PhoneCall}
              primaryMessage="No conversations yet"
              secondaryMessage="Start a test call to record the first one."
            />
          )}
        </div>
      </aside>

      <main className="flex min-w-0 flex-1 flex-col overflow-hidden rounded-xl bg-surface">
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
            Icon={PhoneCall}
            primaryMessage="Select a conversation"
            secondaryMessage="Its transcript, timing, and tool calls appear here."
          />
        )}
      </main>
    </div>
  );
};

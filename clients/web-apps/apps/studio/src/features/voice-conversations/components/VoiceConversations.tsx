import { VoiceCaptions } from "@avplatform/assistant-chat";
import { EmptyState } from "@avplatform/ui";
import { Badge } from "@avplatform/ui/badge";
import { cn } from "@avplatform/ui/lib";
import { AlertTriangle, AudioLines, FileText, PhoneCall } from "lucide-react";
import { useState } from "react";

import { useFetchFlowToLoad } from "@/features/react-flow/hooks/useFetchFlowToLoad";
import { useCurrentFlowStore } from "@/stores/current-flow-store";

import { SAMPLE_VOICE_CONVERSATIONS } from "../constants/voice-conversation-samples.constant";
import type {
  VoiceConversation,
  VoiceConversationChannel,
  VoiceConversationOutcome,
} from "../types/voice-conversation.type";

type ChannelFilter = "all" | VoiceConversationChannel;

const CHANNEL_FILTERS: { value: ChannelFilter; label: string }[] = [
  { value: "all", label: "All" },
  { value: "test", label: "Test" },
  { value: "workspace", label: "Workspace" },
];

const LATER_CHANNELS = ["Phone", "Widget"];

const CHANNEL_LABELS: Record<VoiceConversationChannel, string> = {
  test: "Test",
  workspace: "Workspace",
};

const OUTCOMES: Record<
  VoiceConversationOutcome,
  { label: string; variant: "completed" | "queued" | "failed" }
> = {
  completed: { label: "Completed", variant: "completed" },
  "caller-hung-up": { label: "Caller hung up", variant: "queued" },
  error: { label: "Error", variant: "failed" },
};

const formatDuration = (ms: number) => {
  const totalSeconds = Math.round(ms / 1000);
  return `${Math.floor(totalSeconds / 60)}:${String(totalSeconds % 60).padStart(2, "0")}`;
};

const formatStartedAt = (iso: string) =>
  new Date(iso).toLocaleString(undefined, { dateStyle: "medium", timeStyle: "short" });

const getAverageFirstAudio = (conversation: VoiceConversation) => {
  const timings = conversation.turns.flatMap((turn) =>
    turn.latency ? [turn.latency.firstAudioMs] : [],
  );
  if (!timings.length) return "-";
  return `${(timings.reduce((sum, ms) => sum + ms, 0) / timings.length / 1000).toFixed(1)} s`;
};

const getToolCount = (conversation: VoiceConversation) =>
  conversation.turns.reduce((count, turn) => count + (turn.toolCalls?.length ?? 0), 0);

const ConversationRow = ({
  conversation,
  isSelected,
  onSelect,
}: {
  conversation: VoiceConversation;
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
      <span className="truncate text-body font-semibold text-ink">{conversation.callerName}</span>
      <span className="shrink-0 font-mono text-[12px] tabular-nums text-muted-foreground">
        {formatDuration(conversation.durationMs)}
      </span>
    </div>
    <div className="flex items-center gap-1.5">
      <Badge variant={OUTCOMES[conversation.outcome].variant}>
        {OUTCOMES[conversation.outcome].label}
      </Badge>
      <Badge variant="outline">{CHANNEL_LABELS[conversation.channel]}</Badge>
      <span className="ml-auto text-hint text-muted-foreground">
        {formatStartedAt(conversation.startedAt)}
      </span>
    </div>
  </button>
);

const PhasePlaceholder = ({ icon: Icon, title }: { icon: typeof FileText; title: string }) => (
  <div className="flex items-center gap-2 rounded-lg border border-dashed border-line-strong px-3 py-2 text-hint text-muted-foreground">
    <Icon aria-hidden="true" className="size-3.5" />
    {title}
    <Badge variant="draft" className="ml-auto">
      Phase 6
    </Badge>
  </div>
);

const ConversationDetail = ({
  conversation,
  agentName,
}: {
  conversation: VoiceConversation;
  agentName: string;
}) => {
  const stats = [
    { label: "Duration", value: formatDuration(conversation.durationMs) },
    { label: "Turns", value: String(conversation.turns.length) },
    { label: "Avg first audio", value: getAverageFirstAudio(conversation) },
    { label: "Tool calls", value: String(getToolCount(conversation)) },
  ];

  return (
    <div className="flex min-h-0 flex-1 flex-col">
      <div className="flex flex-col gap-3 border-b border-line px-6 py-4">
        <div className="flex flex-wrap items-center gap-2">
          <h2 className="text-heading text-ink">{conversation.callerName}</h2>
          <Badge variant={OUTCOMES[conversation.outcome].variant}>
            {OUTCOMES[conversation.outcome].label}
          </Badge>
          <Badge variant="outline">{CHANNEL_LABELS[conversation.channel]}</Badge>
          <Badge variant="secondary">v{conversation.versionNumber}</Badge>
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
        <div className="grid gap-2 md:grid-cols-2">
          <PhasePlaceholder icon={AudioLines} title="Call recording" />
          <PhasePlaceholder icon={FileText} title="Call summary and outcome" />
        </div>
      </div>

      <div className="min-h-0 flex-1 overflow-y-auto px-6 py-5">
        <div className="mx-auto flex max-w-2xl flex-col gap-4">
          <VoiceCaptions
            turns={conversation.turns}
            agentName={agentName}
            callerName="Caller"
            showLatency
          />
          {conversation.errorMessage && (
            <div
              role="alert"
              className="flex items-start gap-2 rounded-lg border border-bad/35 bg-bad/5 px-3 py-2 text-body-sm text-bad"
            >
              <AlertTriangle aria-hidden="true" className="mt-0.5 size-4 shrink-0" />
              {conversation.errorMessage}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

/** Voice agent sessions with duration, outcome, and transcript. Uses sample data until Phase 2. */
export const VoiceConversations = () => {
  useFetchFlowToLoad();
  const agentName = useCurrentFlowStore((state) => state.currentFlow.name) || "Agent";
  const [channel, setChannel] = useState<ChannelFilter>("all");
  const [selectedId, setSelectedId] = useState(SAMPLE_VOICE_CONVERSATIONS[0]?.id);

  const conversations = SAMPLE_VOICE_CONVERSATIONS.filter(
    (conversation) => channel === "all" || conversation.channel === channel,
  );
  const selected = conversations.find((conversation) => conversation.id === selectedId);

  return (
    <div className="flex h-full gap-1.5 bg-bg p-1.5">
      <aside className="flex w-[360px] shrink-0 flex-col overflow-hidden rounded-xl bg-surface">
        <div className="flex flex-col gap-3 border-b border-line px-4 py-3">
          <div className="flex items-center gap-2">
            <h1 className="text-heading text-ink">Conversations</h1>
            <Badge variant="draft">Sample data</Badge>
          </div>
          <div role="group" aria-label="Channel" className="flex flex-wrap gap-1">
            {CHANNEL_FILTERS.map((filter) => (
              <button
                key={filter.value}
                type="button"
                aria-pressed={channel === filter.value}
                onClick={() => setChannel(filter.value)}
                className={cn(
                  "h-6 rounded-sm border border-line px-2 text-[12.5px] font-medium text-ink-2 hover:bg-hover focus-visible:shadow-focus focus-visible:outline-none",
                  channel === filter.value && "border-line-strong bg-fill text-ink",
                )}
              >
                {filter.label}
              </button>
            ))}
            {LATER_CHANNELS.map((label) => (
              <span
                key={label}
                title="Arrives in Phase 4"
                className="inline-flex h-6 items-center gap-1 rounded-sm border border-dashed border-line px-2 text-[12.5px] text-muted-foreground"
              >
                {label}
                <span className="font-mono text-[10px] uppercase">P4</span>
              </span>
            ))}
          </div>
        </div>
        <div className="min-h-0 flex-1 overflow-y-auto">
          {conversations.map((conversation) => (
            <ConversationRow
              key={conversation.id}
              conversation={conversation}
              isSelected={conversation.id === selected?.id}
              onSelect={() => setSelectedId(conversation.id)}
            />
          ))}
        </div>
      </aside>

      <main className="flex min-w-0 flex-1 flex-col overflow-hidden rounded-xl bg-surface">
        {selected ? (
          <ConversationDetail conversation={selected} agentName={agentName} />
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

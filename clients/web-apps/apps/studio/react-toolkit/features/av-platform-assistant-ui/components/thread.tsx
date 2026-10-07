import {
  ActionBarMorePrimitive,
  ActionBarPrimitive,
  AuiIf,
  BranchPickerPrimitive,
  ComposerPrimitive,
  ErrorPrimitive,
  type GroupByContext,
  MessagePrimitive,
  type PartState,
  SuggestionPrimitive,
  ThreadPrimitive,
  groupPartByType,
  useAui,
  useAuiState,
} from "@assistant-ui/react";
import {
  ChatToolCall,
  ThinkingIndicator,
  ToolApprovalBulkBar,
  ToolApprovalRequest,
  humanizeToolLabel,
  useHasPendingToolCalls,
  useToolCallCoordinatorStore,
} from "@avplatform/assistant-chat";
import { Button } from "@avplatform/ui/buttons";
import { cn } from "@avplatform/ui/lib";
import {
  ArrowDownIcon,
  ArrowUpIcon,
  CheckIcon,
  ChevronDownIcon,
  ChevronLeftIcon,
  ChevronRightIcon,
  ChevronUpIcon,
  CopyIcon,
  DownloadIcon,
  LoaderCircleIcon,
  Mic,
  MoreHorizontalIcon,
  PauseIcon,
  PencilIcon,
  PlayIcon,
  Plus,
  RefreshCwIcon,
  SparklesIcon,
  SquareIcon,
  Volume2Icon,
  VolumeXIcon,
} from "lucide-react";
import type { FC, KeyboardEvent } from "react";
import { useCallback, useState } from "react";
import { useShallow } from "zustand/react/shallow";

import { useThreadConfigStore } from "../stores/assitant-ui-store";
import { useAssistantVoiceContext } from "../voice/hooks/useAssistantVoiceContext.hook";
import { useVoiceRecorder } from "../voice/hooks/useVoiceRecorder.hook";
import Archived from "./Archived";
import { ComposerAddAttachment, ComposerAttachments, UserMessageAttachments } from "./attachment";
import { MarkdownText } from "./markdown-text";
import { TooltipIconButton } from "./tooltip-icon-button";

function FollowUps() {
  const suggestions = useAuiState((s) => s.thread.suggestions);
  const hasPending = useHasPendingToolCalls();

  const cancelAll = useToolCallCoordinatorStore(useShallow((state) => state.cancelAll));

  // Return null if there are no suggestions,
  if (!suggestions || suggestions.length === 0) return null;

  return (
    <AuiIf condition={(s) => !s.thread.isEmpty && !s.thread.isRunning}>
      <div className="flex flex-wrap gap-2 pb-4">
        {suggestions.map((s, i) => (
          <ThreadPrimitive.Suggestion
            key={i}
            prompt={s.prompt}
            send
            asChild
            onClick={() => {
              if (hasPending) {
                cancelAll();
              }
            }}
          >
            <Button
              variant="outline"
              className=" h-auto  text-wrap items-start justify-start gap-1 rounded-full italic border bg-background px-3.5 py-2 text-left text-sm transition-colors hover:bg-muted "
            >
              {s.prompt}
            </Button>
          </ThreadPrimitive.Suggestion>
        ))}
      </div>
    </AuiIf>
  );
}

type ThreadHeaderProps = {
  title?: string;
  description?: string;
  badge?: string;
  allowNewSession?: boolean;
  onNewSession?: () => void;
};

export const Thread = ({
  title,
  description,
  badge,
  allowNewSession,
  onNewSession,
}: ThreadHeaderProps) => {
  const { readOnly, archived } = useThreadConfigStore();
  const isDisabled = readOnly || archived;

  return (
    <ThreadPrimitive.Root
      className="aui-root aui-thread-root flex h-full flex-col bg-background"
      style={{
        ["--thread-max-width" as string]: "60rem",
        ["--composer-radius" as string]: "0.5rem",
        ["--composer-padding" as string]: "10px",
      }}
    >
      {/* Persistent header with the new-session action; hidden while the thread is empty. */}
      {!isDisabled && allowNewSession && (
        <AuiIf condition={(s) => !s.thread.isEmpty}>
          <ThreadHeader title={title} badge={badge} onNewSession={onNewSession} />
        </AuiIf>
      )}

      <ThreadPrimitive.Viewport
        turnAnchor="top"
        scrollToBottomOnRunStart
        scrollToBottomOnThreadSwitch
        scrollToBottomOnInitialize
        className="aui-thread-viewport relative flex flex-1 flex-col overflow-x-auto overflow-y-scroll scroll-smooth px-4 pt-4"
      >
        {!isDisabled && (
          <AuiIf condition={(s) => s.thread.isEmpty}>
            <ThreadWelcome title={title} description={description} badge={badge} />
          </AuiIf>
        )}

        <ThreadPrimitive.Messages>{() => <ThreadMessage />}</ThreadPrimitive.Messages>

        <FollowUps />

        <ThreadPrimitive.ViewportFooter className="aui-thread-viewport-footer sticky bottom-0 mx-auto mt-auto flex w-full max-w-[var(--thread-max-width)] flex-col gap-4 overflow-visible rounded-t-[var(--composer-radius)] bg-background pb-4 md:pb-6">
          <ThreadScrollToBottom />
          {isDisabled ? readOnly ? <ReadOnlyBanner /> : <Archived /> : <Composer />}
        </ThreadPrimitive.ViewportFooter>
      </ThreadPrimitive.Viewport>
    </ThreadPrimitive.Root>
  );
};

const ThreadHeader = ({
  title,
  badge,
  onNewSession,
}: Pick<ThreadHeaderProps, "title" | "badge" | "onNewSession">) => {
  const aui = useAui();
  const cancelAll = useToolCallCoordinatorStore(useShallow((state) => state.cancelAll));

  // Stop the streaming response and any pending tool calls, then clear the session.
  const handleNewSession = () => {
    aui.thread.cancelRun();
    cancelAll();
    onNewSession?.();
  };

  return (
    <div className="aui-thread-header flex w-full shrink-0 items-center justify-between gap-2 border-b px-4 py-2">
      <div className="flex min-w-0 items-center gap-2">
        <span className="truncate text-sm font-medium">{title ?? "Chat"}</span>
        {badge && (
          <span className="inline-flex shrink-0 items-center gap-1.5 rounded-full border border-primary/25 bg-primary/10 px-2 py-0.5 text-xs font-medium text-primary">
            <span className="size-1.5 rounded-full bg-primary" />
            {badge}
          </span>
        )}
      </div>
      <div className="flex shrink-0 items-center gap-1">
        <TooltipIconButton
          tooltip="New chat"
          side="left"
          variant="ghost"
          size="icon8"
          className="aui-thread-new-session size-8 shrink-0 rounded-md"
          aria-label="Start new chat"
          onClick={handleNewSession}
        >
          <Plus className="size-4 text-[var(--icon-color)]" />
        </TooltipIconButton>
      </div>
    </div>
  );
};

/**
 * Enter inside the composer must always send the message. Composer buttons
 * other than the send button (mic, speaker) are kept non-submit and must not
 * swallow Enter as their own activation — otherwise pressing Enter while the
 * mic is focused restarts the recording instead of submitting.
 */
const submitComposerOnEnter = (event: KeyboardEvent<HTMLButtonElement>) => {
  if (event.key !== "Enter") return;
  event.preventDefault();
  event.currentTarget.closest("form")?.requestSubmit();
};

/**
 * Composer toggle for spoken replies. Turning it off mutes playback without
 * aborting the run. It stays hoverable while unconfigured (aria-disabled, not
 * the native `disabled`) so the tooltip can explain what is missing.
 */
const SpeakerToggle: FC = () => {
  const voice = useAssistantVoiceContext();
  if (!voice) return null;

  const missingModel = !voice.ttsConfig?.model?.trim();
  const missingCredential =
    Boolean(voice.ttsConfig?.is_byok_enabled) && !voice.ttsConfig?.credential_name?.trim();

  const disabledReason =
    missingModel && missingCredential
      ? "Select a Text to Speech model and credential to hear replies."
      : missingModel
        ? "Select a Text to Speech model to hear replies."
        : missingCredential
          ? "Select a credential for Text to Speech to hear replies."
          : null;

  const isDisabled = disabledReason !== null;
  const label = voice.speakReplies ? "Mute spoken replies" : "Speak replies";
  const tooltip = disabledReason ?? label;

  return (
    <TooltipIconButton
      tooltip={tooltip}
      side="bottom"
      type="button"
      variant="ghost"
      size="icon8"
      className="aui-composer-speak-replies size-8 shrink-0 rounded-full data-[disabled]:cursor-not-allowed data-[disabled]:opacity-80 data-[disabled]:hover:bg-transparent"
      aria-label={tooltip}
      aria-pressed={voice.speakReplies}
      aria-disabled={isDisabled}
      data-disabled={isDisabled ? "true" : undefined}
      onKeyDown={submitComposerOnEnter}
      onClick={() => {
        if (isDisabled) return;
        voice.setSpeakReplies(!voice.speakReplies);
      }}
    >
      {voice.speakReplies ? (
        <Volume2Icon className={cn("size-4", voice.isPlaying && "text-primary")} />
      ) : (
        <VolumeXIcon className="size-4 text-[var(--icon-color)]" />
      )}
    </TooltipIconButton>
  );
};

const ReadOnlyBanner: FC = () => (
  <div className="flex w-full items-center justify-center rounded-lg border  bg-muted px-4 py-3 text-muted-foreground text-sm">
    This conversation is in read-only mode.
  </div>
);

const ThreadMessage: FC = () => {
  const { readOnly, archived } = useThreadConfigStore();
  const isDisabled = readOnly || archived;
  const role = useAuiState((s) => s.message.role);
  const isEditing = useAuiState((s) => s.message.composer.isEditing);

  if (isEditing && !isDisabled) return <EditComposer />;
  if (role === "user") return <UserMessage />;
  return <AssistantMessage />;
};

const ThreadScrollToBottom: FC = () => {
  return (
    <ThreadPrimitive.ScrollToBottom asChild>
      <TooltipIconButton
        tooltip="Scroll to bottom"
        variant="outline"
        className="aui-thread-scroll-to-bottom group !size-8 absolute -top-12 z-10 self-center bg-slate-100 rounded-full p-0 disabled:invisible dark:border-border dark:bg-background dark:hover:bg-accent"
      >
        <ArrowDownIcon className="size-4 text-[var(--icon-color)] group-hover:text-primary" />
      </TooltipIconButton>
    </ThreadPrimitive.ScrollToBottom>
  );
};

const ThreadWelcome = ({ title, description, badge }: ThreadHeaderProps) => {
  return (
    <div className="aui-thread-welcome-root mx-auto my-auto flex w-full max-w-[var(--thread-max-width)] grow flex-col">
      <div className="aui-thread-welcome-center flex w-full grow flex-col items-center justify-center">
        <div className="aui-thread-welcome-message gap-1 flex size-full flex-col justify-center items-center px-4">
          {badge && (
            <span className="mb-1 inline-flex items-center gap-1.5 rounded-full border border-primary/25 bg-primary/10 px-2.5 py-0.5 text-xs font-medium text-primary">
              <span className="size-1.5 rounded-full bg-primary" />
              {badge}
            </span>
          )}
          <h1 className="aui-thread-welcome-message-inner fade-in slide-in-from-bottom-1 animate-in fill-mode-both font-semibold text-xl duration-200 capitalize">
            {title ?? "Hello"}
          </h1>
          <p className="aui-thread-welcome-message-inner fade-in slide-in-from-bottom-1 animate-in fill-mode-both text-muted-foreground text-base delay-75 duration-200">
            {description ?? "Send a message to start the conversation"}
          </p>
        </div>
      </div>
      <ThreadSuggestions />
    </div>
  );
};

const ThreadSuggestions: FC = () => {
  return (
    <div className="aui-thread-welcome-suggestions flex gap-2 pb-4 w-full flex-wrap">
      <ThreadPrimitive.Suggestions>{() => <ThreadSuggestionItem />}</ThreadPrimitive.Suggestions>
    </div>
  );
};

const ThreadSuggestionItem: FC = () => {
  return (
    <div className="aui-thread-welcome-suggestion-display fade-in slide-in-from-bottom-2 animate-in fill-mode-both duration-200 [&:nth-child(n+3)]:hidden md:[&:nth-child(n+3)]:block">
      <SuggestionPrimitive.Trigger send asChild>
        <Button
          variant="outline"
          className="aui-thread-welcome-suggestion h-auto  flex-wrap items-start justify-start gap-1 rounded-full border bg-background px-3.5 py-2 text-left text-sm transition-colors hover:bg-muted md:flex-col"
        >
          <SuggestionPrimitive.Title className="aui-thread-welcome-suggestion-text-1 italic leading-tight  text-wrap font-medium" />
          <SuggestionPrimitive.Description className="aui-thread-welcome-suggestion-text-2 text-muted-foreground empty:hidden" />
        </Button>
      </SuggestionPrimitive.Trigger>
    </div>
  );
};

const Composer: FC = () => {
  const hasPending = useHasPendingToolCalls();

  return (
    <ComposerPrimitive.Root className="aui-composer-root relative flex w-full flex-col">
      <ComposerPrimitive.AttachmentDropzone asChild>
        <div
          data-slot="composer-shell"
          className="flex w-full flex-col gap-2 rounded-[var(--composer-radius)] border bg-background p-[var(--composer-padding)] transition-shadow focus-within:border-ring/75 focus-within:ring-2 focus-within:ring-ring/20 data-[dragging=true]:border-ring data-[dragging=true]:border-dashed data-[dragging=true]:bg-accent/50"
        >
          <ComposerAttachments />
          <ComposerPrimitive.Input
            placeholder="Send a message..."
            className="aui-composer-input max-h-32 min-h-10 w-full resize-none bg-transparent px-2 py-1 text-sm outline-none placeholder:text-muted-foreground/80"
            rows={1}
            disabled={hasPending}
            autoFocus={!hasPending}
            aria-label="Message input"
          />
          <ComposerAction />
        </div>
      </ComposerPrimitive.AttachmentDropzone>
    </ComposerPrimitive.Root>
  );
};

/** Formats an elapsed second count as `m:ss` for the recording indicator. */
const formatRecordingTime = (totalSeconds: number): string => {
  const minutes = Math.floor(totalSeconds / 60);
  const seconds = totalSeconds % 60;
  return `${minutes}:${seconds.toString().padStart(2, "0")}`;
};

const ComposerAction: FC = () => {
  const hasPending = useHasPendingToolCalls();

  const cancelAll = useToolCallCoordinatorStore(useShallow((state) => state.cancelAll));
  const aui = useAui();
  const voice = useAssistantVoiceContext();

  // Append the transcript to whatever the user has already typed.
  const handleTranscript = useCallback(
    (text: string) => {
      const existing = aui.composer.getState().text;
      aui.composer.setText(existing.trim() ? `${existing.trimEnd()} ${text}` : text);
    },
    [aui],
  );

  const {
    isRecording,
    isTranscribing,
    recordingSeconds,
    isMicDisabled,
    micTooltip,
    toggleRecording,
  } = useVoiceRecorder({
    sttConfig: voice?.sttConfig ?? null,
    refId: voice?.refId ?? "",
    refName: voice?.refName ?? "",
    agentName: voice?.agentName ?? null,
    language: voice?.language ?? null,
    onTranscript: handleTranscript,
  });

  return (
    <div className="aui-composer-action-wrapper relative flex items-center justify-between">
      <div className="flex items-center gap-1">
        <ComposerAddAttachment />
        {/* Keep the mic hoverable while unconfigured: use aria-disabled (not the native
            `disabled`, which applies pointer-events-none) so the tooltip can explain what
            is missing. The click is ignored inside `toggleRecording`. */}
        {voice && (
          <>
            <TooltipIconButton
              tooltip={micTooltip}
              side="bottom"
              type="button"
              variant="ghost"
              size="icon8"
              className="aui-composer-mic size-8 shrink-0 rounded-full data-[disabled]:cursor-not-allowed data-[disabled]:opacity-80 data-[disabled]:hover:bg-transparent"
              aria-label={micTooltip}
              aria-pressed={isRecording}
              aria-disabled={isMicDisabled}
              data-disabled={isMicDisabled ? "true" : undefined}
              onKeyDown={submitComposerOnEnter}
              onClick={toggleRecording}
            >
              {isTranscribing ? (
                <LoaderCircleIcon className="size-4 animate-spin" />
              ) : isRecording ? (
                <SquareIcon className="size-3 fill-current text-destructive" />
              ) : (
                <Mic className="size-4" />
              )}
            </TooltipIconButton>
            {isRecording && (
              <span
                className="aui-composer-recording-timer text-xs font-medium tabular-nums text-muted-foreground"
                aria-live="polite"
              >
                {formatRecordingTime(recordingSeconds)}
              </span>
            )}
            <SpeakerToggle />
          </>
        )}
      </div>

      <AuiIf condition={(s) => !s.thread.isRunning && !hasPending}>
        <ComposerPrimitive.Send asChild>
          <TooltipIconButton
            tooltip="Send message"
            side="bottom"
            type="button"
            variant="default"
            size="icon6"
            className="aui-composer-send size-8 rounded-full"
            aria-label="Send message"
          >
            <ArrowUpIcon className="aui-composer-send-icon size-4" />
          </TooltipIconButton>
        </ComposerPrimitive.Send>
      </AuiIf>

      <AuiIf condition={(s) => s.thread.isRunning || hasPending}>
        <ComposerPrimitive.Cancel asChild>
          <Button
            type="button"
            variant="default"
            size="icon6"
            className="aui-composer-cancel size-8 rounded-full"
            aria-label="Stop generating"
            onClick={() => {
              if (hasPending) {
                cancelAll();
              }
            }}
          >
            <SquareIcon className="aui-composer-cancel-icon size-3 fill-current" />
          </Button>
        </ComposerPrimitive.Cancel>
      </AuiIf>
    </div>
  );
};

const MessageError: FC = () => {
  return (
    <MessagePrimitive.Error>
      <ErrorPrimitive.Root className="aui-message-error-root mt-2 rounded-md border border-destructive bg-destructive/10 p-3 text-destructive text-sm dark:bg-destructive/5 dark:text-red-200">
        <ErrorPrimitive.Message className="aui-message-error-message line-clamp-2" />
      </ErrorPrimitive.Root>
    </MessagePrimitive.Error>
  );
};

// Consecutive reasoning and tool-call parts collapse into one chain-of-thought
// group; selected skills (native data parts) join the same group. Approval
// gates are kept out of that group so they are always visible when paused.
const baseGroupBy = groupPartByType({
  reasoning: ["group-thought", "group-reasoning"],
  "tool-call": ["group-thought", "group-tool"],
});

const groupMessageParts = (
  part: PartState,
  context?: GroupByContext,
): readonly `group-${string}`[] => {
  if (part.type === "tool-call" && part.approval) {
    return ["group-approval"];
  }
  if (part.type === "data" && (part as { name?: string }).name === "skill") {
    return ["group-thought", "group-skill"];
  }
  return baseGroupBy(part, context);
};

/**
 * Collapsible container for a turn's chain-of-thought (reasoning, selected
 * skills, and tool calls). Auto-expands while that message is running and
 * collapses to a compact header once it completes.
 */
const ChainOfThought: FC<{
  status: { type: string };
  indices: readonly number[];
  counts: { running: number; incomplete: number; requiresAction: number };
  children: React.ReactNode;
}> = ({ status, indices, counts, children }) => {
  const [open, setOpen] = useState(false);
  const parts = useAuiState((s) => s.message.parts);
  const isRunning = status.type === "running" || counts.running > 0;
  const isOpen = isRunning || open;

  const groupParts = indices
    .map((index) => parts[index])
    .filter((part): part is PartState => Boolean(part));
  const toolCount = groupParts.filter((part) => part.type === "tool-call").length;
  const hasReasoning = groupParts.some((part) => part.type === "reasoning");
  const hasIncomplete = counts.incomplete > 0;
  const lastPart = groupParts[groupParts.length - 1];

  // While running, name the current step (tool or skill) like a live status;
  // once complete, summarize the turn.
  const runningLabel =
    lastPart?.type === "tool-call"
      ? humanizeToolLabel(lastPart.toolName)
      : lastPart?.type === "data" && lastPart.name === "skill"
        ? `Using skill ${(lastPart.data as { name?: string } | undefined)?.name ?? ""}`.trim()
        : "Thinking";

  const completeLabel =
    toolCount > 0
      ? `Used ${toolCount} tool${toolCount > 1 ? "s" : ""}`
      : hasReasoning
        ? "Thought process"
        : "Details";

  return (
    <div className="aui-assistant-chain-of-thought my-2 w-full overflow-hidden rounded-lg border border-border/60 bg-muted/30">
      <button
        type="button"
        onClick={() => setOpen((value) => !value)}
        className="flex w-full items-center gap-1.5 px-2.5 py-1.5 text-left text-xs text-muted-foreground transition-colors hover:bg-muted/50"
        aria-expanded={isOpen}
      >
        {isOpen ? (
          <ChevronUpIcon className="size-3.5 shrink-0" />
        ) : (
          <ChevronDownIcon className="size-3.5 shrink-0" />
        )}
        {isRunning ? (
          <LoaderCircleIcon className="size-3.5 shrink-0 animate-spin text-primary" />
        ) : (
          <CheckIcon
            className={cn(
              "size-3.5 shrink-0",
              hasIncomplete ? "text-destructive" : "text-muted-foreground/70",
            )}
          />
        )}
        <span className={cn("font-medium", isRunning && "animate-pulse")}>
          {isRunning ? runningLabel : completeLabel}
        </span>
      </button>
      {isOpen && (
        <div className="aui-assistant-chain-of-thought-content space-y-1 border-t border-border/60 px-3 py-2 text-xs leading-relaxed text-muted-foreground">
          {children}
        </div>
      )}
    </div>
  );
};

/** Genuine model reasoning/thinking text inside a chain-of-thought group. */
const ReasoningBlock: FC<{ text: string }> = ({ text }) => {
  if (!text.trim()) return null;
  return (
    <div className="aui-assistant-reasoning-block whitespace-pre-wrap text-muted-foreground italic">
      {text}
    </div>
  );
};

/** A skill the planner selected for this turn. */
const SkillChip: FC<{ name?: string }> = ({ name }) => {
  if (!name) return null;
  return (
    <div className="aui-assistant-skill-chip my-1 inline-flex items-center gap-1.5 rounded-full border border-border/60 bg-background/60 px-2.5 py-1 text-muted-foreground text-xs">
      <SparklesIcon className="size-3" />
      <span>Using skill: {name}</span>
    </div>
  );
};

/** Native per-message loading affordance shown while the assistant works. */
const MessageThinking: FC = () => {
  const startedAt = useAuiState((s) => s.message.createdAt);
  return <ThinkingIndicator startedAt={startedAt} className="mt-1 px-2" />;
};

const AssistantMessage: FC = () => {
  const { readOnly, archived } = useThreadConfigStore();
  const isDisabled = readOnly || archived;

  return (
    <MessagePrimitive.Root
      className="aui-assistant-message-root text-sm fade-in slide-in-from-bottom-1 relative mx-auto w-full max-w-[var(--thread-max-width)] animate-in py-3 duration-150 !min-h-fit !h-fit"
      data-role="assistant"
    >
      <div className="aui-assistant-message-content wrap-break-word px-2 text-foreground leading-relaxed">
        <MessagePrimitive.GroupedParts groupBy={groupMessageParts} indicator="no-text">
          {({ part, children }) => {
            switch (part.type) {
              case "group-thought":
                return (
                  <ChainOfThought status={part.status} indices={part.indices} counts={part.counts}>
                    {children}
                  </ChainOfThought>
                );
              case "group-approval":
              case "group-reasoning":
              case "group-tool":
              case "group-skill":
                return <>{children}</>;
              case "reasoning":
                return <ReasoningBlock text={part.text} />;
              case "tool-call": {
                // Server-side approval gates get a dedicated confirmation card;
                // chat-agent tools run server-side, so they render display-only.
                if (part.approval) {
                  return (
                    <div className="my-2 w-full">
                      <ToolApprovalRequest {...part} disabled={isDisabled} />
                    </div>
                  );
                }
                return (
                  <div className="my-1 w-full">
                    {/* Fallback pattern for dynamically rendered tool UIs */}
                    {part.toolUI ?? <ChatToolCall {...part} />}
                  </div>
                );
              }
              case "data":
                return part.name === "skill" ? (
                  <SkillChip name={(part.data as { name?: string } | undefined)?.name} />
                ) : null;
              case "text":
                if (!part.text || part.text.trim() === "") return null;
                // Render Markdown if there is text.
                return <MarkdownText />;
              case "indicator":
                return <MessageThinking />;
              default:
                return null;
            }
          }}
        </MessagePrimitive.GroupedParts>

        <ToolApprovalBulkBar disabled={isDisabled} />
        <MessageError />
      </div>

      <div className="aui-assistant-message-footer mt-1 ml-2 flex min-h-6 items-center">
        <BranchPicker />
        <AssistantActionBar readOnly={isDisabled} />
      </div>
    </MessagePrimitive.Root>
  );
};

const AssistantActionBar: FC<{ readOnly: boolean }> = ({ readOnly }) => {
  const voice = useAssistantVoiceContext();
  const messageId = useAuiState((s) => s.message.id);
  // Only answer text is spoken; reasoning/thinking parts stay silent.
  const messageText = useAuiState((s) =>
    s.message.content
      .map((part) => (part.type === "text" ? part.text : ""))
      .join("\n")
      .trim(),
  );

  const isActiveClip = voice?.activeKey === messageId;
  const isPlayingThis = Boolean(voice?.isPlaying && isActiveClip);
  const speakTooltip = isPlayingThis ? "Pause" : isActiveClip ? "Resume" : "Read aloud";

  return (
    <ActionBarPrimitive.Root
      hideWhenRunning
      autohide="not-last"
      className="aui-assistant-action-bar-root col-start-3 row-start-2 -ml-1 flex gap-1 text-muted-foreground"
    >
      {voice && messageText.length > 0 && (
        <TooltipIconButton
          tooltip={speakTooltip}
          className="aui-assistant-action-bar-speak"
          aria-label={speakTooltip}
          aria-pressed={isPlayingThis}
          onClick={() => voice.toggleMessageSpeech(messageId, messageText)}
        >
          {isPlayingThis ? <PauseIcon /> : isActiveClip ? <PlayIcon /> : <Volume2Icon />}
        </TooltipIconButton>
      )}

      <ActionBarPrimitive.Copy asChild>
        <TooltipIconButton tooltip="Copy">
          <AuiIf condition={(s) => s.message.isCopied}>
            <CheckIcon />
          </AuiIf>
          <AuiIf condition={(s) => !s.message.isCopied}>
            <CopyIcon />
          </AuiIf>
        </TooltipIconButton>
      </ActionBarPrimitive.Copy>

      {/* Regenerate hidden in read-only */}
      {!readOnly && (
        <ActionBarPrimitive.Reload asChild>
          <TooltipIconButton tooltip="Refresh">
            <RefreshCwIcon />
          </TooltipIconButton>
        </ActionBarPrimitive.Reload>
      )}

      <ActionBarMorePrimitive.Root>
        <ActionBarMorePrimitive.Trigger asChild>
          <TooltipIconButton tooltip="More" className="data-[state=open]:bg-accent">
            <MoreHorizontalIcon />
          </TooltipIconButton>
        </ActionBarMorePrimitive.Trigger>
        <ActionBarMorePrimitive.Content
          side="bottom"
          align="start"
          className="aui-action-bar-more-content z-50 min-w-32 overflow-hidden rounded-md border bg-popover p-1 text-popover-foreground shadow-md"
        >
          <ActionBarPrimitive.ExportMarkdown asChild>
            <ActionBarMorePrimitive.Item className="aui-action-bar-more-item flex cursor-pointer select-none items-center gap-2 rounded-sm px-2 py-1.5 text-sm outline-none hover:bg-accent hover:text-accent-foreground focus:bg-accent focus:text-accent-foreground">
              <DownloadIcon className="size-4" />
              Export as Markdown
            </ActionBarMorePrimitive.Item>
          </ActionBarPrimitive.ExportMarkdown>
        </ActionBarMorePrimitive.Content>
      </ActionBarMorePrimitive.Root>
    </ActionBarPrimitive.Root>
  );
};

const UserMessage: FC = () => {
  const { readOnly, archived } = useThreadConfigStore();
  const isDisabled = readOnly || archived;
  return (
    <MessagePrimitive.Root
      className="aui-user-message-root text-sm fade-in slide-in-from-bottom-1 mx-auto grid w-full max-w-[var(--thread-max-width)] animate-in auto-rows-auto grid-cols-[minmax(72px,1fr)_auto] content-start gap-y-2 px-2 py-3 duration-150 [&:where(>*)]:col-start-2"
      data-role="user"
    >
      <UserMessageAttachments />

      <div className="aui-user-message-content-wrapper relative col-start-2 min-w-0">
        <div className="aui-user-message-content wrap-break-word peer rounded-2xl bg-muted px-4 py-2.5 text-foreground empty:hidden">
          <MessagePrimitive.Parts />
        </div>
        {/* Edit button hidden in read-only */}
        {!isDisabled && (
          <div className="aui-user-action-bar-wrapper absolute top-1/2 left-0 -translate-x-full -translate-y-1/2 pr-2 peer-empty:hidden">
            <UserActionBar />
          </div>
        )}
      </div>

      <BranchPicker className="aui-user-branch-picker col-span-full col-start-1 row-start-3 -mr-1 justify-end" />
    </MessagePrimitive.Root>
  );
};

const UserActionBar: FC = () => {
  return (
    <ActionBarPrimitive.Root
      hideWhenRunning
      autohide="not-last"
      className="aui-user-action-bar-root flex flex-col items-end"
    >
      <ActionBarPrimitive.Edit asChild>
        <TooltipIconButton tooltip="Edit" className="aui-user-action-edit size-8 p-0">
          <PencilIcon className="size-3.5 text-[var(--icon-color)] group-hover:text-primary" />
        </TooltipIconButton>
      </ActionBarPrimitive.Edit>
    </ActionBarPrimitive.Root>
  );
};

const EditComposer: FC = () => {
  return (
    <MessagePrimitive.Root className="aui-edit-composer-wrapper mx-auto flex w-full max-w-[var(--thread-max-width)] flex-col px-2 py-3">
      <ComposerPrimitive.Root className="aui-edit-composer-root ml-auto flex w-full max-w-[85%] flex-col rounded-2xl bg-muted">
        <ComposerPrimitive.Input
          className="aui-edit-composer-input min-h-14 w-full resize-none bg-transparent p-4 text-foreground text-sm outline-none"
          autoFocus
        />
        <div className="aui-edit-composer-footer mx-3 mb-3 flex items-center gap-2 self-end">
          <ComposerPrimitive.Cancel asChild>
            <Button variant="ghost" size="sm">
              Cancel
            </Button>
          </ComposerPrimitive.Cancel>
          <ComposerPrimitive.Send asChild>
            <Button size="sm">Update</Button>
          </ComposerPrimitive.Send>
        </div>
      </ComposerPrimitive.Root>
    </MessagePrimitive.Root>
  );
};

const BranchPicker: FC<BranchPickerPrimitive.Root.Props> = ({ className, ...rest }) => {
  return (
    <BranchPickerPrimitive.Root
      hideWhenSingleBranch
      className={cn(
        "aui-branch-picker-root mr-2 -ml-2 inline-flex items-center text-muted-foreground text-xs",
        className,
      )}
      {...rest}
    >
      <BranchPickerPrimitive.Previous asChild>
        <TooltipIconButton tooltip="Previous">
          <ChevronLeftIcon />
        </TooltipIconButton>
      </BranchPickerPrimitive.Previous>
      <span className="aui-branch-picker-state font-medium">
        <BranchPickerPrimitive.Number /> / <BranchPickerPrimitive.Count />
      </span>
      <BranchPickerPrimitive.Next asChild>
        <TooltipIconButton tooltip="Next">
          <ChevronRightIcon />
        </TooltipIconButton>
      </BranchPickerPrimitive.Next>
    </BranchPickerPrimitive.Root>
  );
};

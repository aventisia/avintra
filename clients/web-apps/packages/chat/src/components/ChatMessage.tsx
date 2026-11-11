import {
  ActionBarPrimitive,
  AuiIf,
  ComposerPrimitive,
  ErrorPrimitive,
  MessagePrimitive,
  type PartState,
  useAuiState,
} from "@assistant-ui/react";
import { ThinkingIndicator } from "@avplatform/assistant-chat";
import { Button } from "@avplatform/ui/buttons";
import { cn } from "@avplatform/ui/lib";
import {
  ArrowClockwiseIcon,
  CheckIcon,
  CopyIcon,
  PencilSimpleIcon,
  ThumbsDownIcon,
  ThumbsUpIcon,
  WarningCircleIcon,
} from "@phosphor-icons/react";
import { useContext } from "react";

import { ChatFileContext } from "../constants/chat-file.constant";
import { ChatThreadMountedAtContext } from "../constants/chat-thread-mounted-at.constant";
import {
  chatFileSize,
  findChatFile,
  textAfterChatFile,
  textBeforeChatFile,
} from "../utils/chat-file.util";
import { NAVIGATE_TOOL_NAME } from "../utils/chat-intent.util";
import { formatMessageTime } from "../utils/message-time.util";
import { ChatActivity, ChatReasoningStep, ChatSkillStep, ChatToolStep } from "./ChatActivity";
import { ChatApproval, ChatApprovalBulkBar } from "./ChatApproval";
import { ChatAttachment } from "./ChatAttachment";
import { ChatBlueprint } from "./ChatBlueprint";
import { ChatDestination } from "./ChatDestination";
import { ChatFileCard } from "./ChatFileCard";
import { ChatIconButton } from "./ChatIconButton";
import { ChatMarkdown } from "./ChatMarkdown";

const useMessageEntranceClass = () => {
  const mountedAt = useContext(ChatThreadMountedAtContext);
  const isFresh = useAuiState((s) => s.message.createdAt.getTime() >= mountedAt);
  return isFresh
    ? "animate-in fade-in slide-in-from-bottom-2 duration-300 ease-out motion-reduce:animate-none"
    : undefined;
};

const ACTIVITY = ["group-activity"] as const;

const groupActivity = (part: PartState) =>
  part.type === "reasoning" ||
  (part.type === "data" && part.name === "skill") ||
  (part.type === "tool-call" && !part.approval && part.toolName !== NAVIGATE_TOOL_NAME)
    ? ACTIVITY
    : null;

const skillName = (data: unknown) => String((data as { name?: unknown } | null)?.name ?? "");

const useHasText = () =>
  useAuiState((s) =>
    s.message.content.some((part) => part.type === "text" && part.text.trim() !== ""),
  );

const MessageCopy = () => (
  <ActionBarPrimitive.Copy asChild>
    <ChatIconButton label="Copy">
      <AuiIf condition={(s) => s.message.isCopied}>
        <CheckIcon className="text-ok" />
      </AuiIf>
      <AuiIf condition={(s) => !s.message.isCopied}>
        <CopyIcon />
      </AuiIf>
    </ChatIconButton>
  </ActionBarPrimitive.Copy>
);

const MessageRegenerate = () => (
  <ActionBarPrimitive.Reload asChild>
    <ChatIconButton label="Regenerate">
      <ArrowClockwiseIcon />
    </ChatIconButton>
  </ActionBarPrimitive.Reload>
);

const MessageEdit = () => (
  <ActionBarPrimitive.Edit asChild>
    <ChatIconButton label="Edit">
      <PencilSimpleIcon />
    </ChatIconButton>
  </ActionBarPrimitive.Edit>
);

const MessageFeedback = () => (
  <>
    <ActionBarPrimitive.FeedbackPositive asChild>
      <ChatIconButton label="Good response">
        <AuiIf condition={(s) => s.message.metadata.submittedFeedback?.type === "positive"}>
          <ThumbsUpIcon weight="fill" />
        </AuiIf>
        <AuiIf condition={(s) => s.message.metadata.submittedFeedback?.type !== "positive"}>
          <ThumbsUpIcon />
        </AuiIf>
      </ChatIconButton>
    </ActionBarPrimitive.FeedbackPositive>
    <ActionBarPrimitive.FeedbackNegative asChild>
      <ChatIconButton label="Bad response">
        <AuiIf condition={(s) => s.message.metadata.submittedFeedback?.type === "negative"}>
          <ThumbsDownIcon weight="fill" />
        </AuiIf>
        <AuiIf condition={(s) => s.message.metadata.submittedFeedback?.type !== "negative"}>
          <ThumbsDownIcon />
        </AuiIf>
      </ChatIconButton>
    </ActionBarPrimitive.FeedbackNegative>
  </>
);

const MessageError = () => (
  <MessagePrimitive.Error>
    <ErrorPrimitive.Root
      role="alert"
      className="mt-3 flex items-start gap-2.5 rounded-xl border border-bad/25 bg-bad/5 px-4 py-3 text-sm leading-6 text-bad"
    >
      <WarningCircleIcon weight="bold" className="mt-1 size-4 shrink-0" />
      <ErrorPrimitive.Message className="line-clamp-4" />
    </ErrorPrimitive.Root>
  </MessagePrimitive.Error>
);

const AssistantText = ({ text }: { text: string }) => {
  const files = useContext(ChatFileContext);
  const isRunning = useAuiState((s) => s.message.status?.type === "running");
  const file = files ? findChatFile(text) : null;
  if (!files || !file) return text.trim() ? <ChatMarkdown /> : null;

  const state = file.isComplete ? files.resolveFile(file) : "saving";
  // A file that never got stored shows as code, so nothing is lost.
  if (state === null && !isRunning) return <ChatMarkdown />;

  const card =
    state && state !== "saving" ? (
      <ChatFileCard
        name={file.name}
        contentType={file.contentType}
        sizeBytes={chatFileSize(file.body)}
        onOpen={() => files.onOpenFile(state.id)}
      />
    ) : (
      <ChatFileCard
        name={file.name}
        contentType={file.contentType}
        progress={file.isComplete ? "Saving…" : "Writing…"}
      />
    );
  return (
    <>
      {textBeforeChatFile(text) && <ChatMarkdown preprocess={textBeforeChatFile} />}
      {card}
      {textAfterChatFile(text) && <ChatMarkdown preprocess={textAfterChatFile} />}
    </>
  );
};

const AssistantThinking = () => {
  const startedAt = useAuiState((s) => s.message.createdAt);
  return <ThinkingIndicator startedAt={startedAt} className="py-1" />;
};

// IMPORTANT NOTE: groupConversationMessages dates a row without createdOn near the epoch; those times are hidden.
const EARLIEST_SHOWN_TIME = Date.UTC(2000, 0);

const MessageTime = () => {
  const createdAt = useAuiState((s) => s.message.createdAt);
  if (createdAt.getTime() < EARLIEST_SHOWN_TIME) return null;
  return (
    <time
      dateTime={createdAt.toISOString()}
      title={createdAt.toLocaleString()}
      className="self-center px-1.5 text-xs text-muted-foreground opacity-0 transition-opacity group-focus-within/message:opacity-100 group-hover/message:opacity-100"
    >
      {formatMessageTime(createdAt)}
    </time>
  );
};

const UserMessage = () => {
  const hasText = useHasText();
  return (
    <MessagePrimitive.Root
      data-role="user"
      className={cn(
        "group/message mx-auto flex w-full max-w-[var(--chat-column)] flex-col items-end gap-1 pb-2 pt-6",
        useMessageEntranceClass(),
      )}
    >
      <div className="flex max-w-[85%] flex-wrap justify-end gap-2 pb-1 empty:hidden">
        <MessagePrimitive.Attachments>{() => <ChatAttachment />}</MessagePrimitive.Attachments>
      </div>
      {hasText && (
        <>
          <div className="max-w-[85%] whitespace-pre-wrap break-words rounded-[1.25rem] bg-sunken px-4 py-2.5 text-base leading-7 text-ink dark:bg-fill">
            <MessagePrimitive.Parts />
          </div>
          <ActionBarPrimitive.Root
            hideWhenRunning
            className="flex opacity-0 transition-opacity focus-within:opacity-100 group-hover/message:opacity-100"
          >
            <MessageTime />
            <MessageEdit />
            <MessageCopy />
          </ActionBarPrimitive.Root>
        </>
      )}
    </MessagePrimitive.Root>
  );
};

const EditComposer = () => (
  <MessagePrimitive.Root className="mx-auto flex w-full max-w-[var(--chat-column)] flex-col items-end pb-2 pt-6">
    <ComposerPrimitive.Root className="flex w-full max-w-[85%] flex-col rounded-[1.25rem] border border-line bg-surface focus-within:border-line-strong">
      <ComposerPrimitive.Input
        autoFocus
        aria-label="Edit message"
        className="max-h-[min(40vh,18rem)] min-h-[3.25rem] w-full resize-none bg-transparent px-4 pb-1 pt-3 text-base leading-7 text-ink outline-none"
      />
      <div className="flex justify-end gap-2 px-3 pb-3">
        <ComposerPrimitive.Cancel asChild>
          <Button variant="ghost">Cancel</Button>
        </ComposerPrimitive.Cancel>
        <ComposerPrimitive.Send asChild>
          <Button>Send</Button>
        </ComposerPrimitive.Send>
      </div>
    </ComposerPrimitive.Root>
  </MessagePrimitive.Root>
);

const AssistantMessage = () => {
  const isLast = useAuiState((s) => s.message.isLast);
  const hasText = useHasText();
  return (
    <MessagePrimitive.Root
      data-role="assistant"
      className={cn(
        "group/message mx-auto w-full max-w-[var(--chat-column)] py-2",
        useMessageEntranceClass(),
      )}
    >
      <div className="text-base leading-7 text-ink">
        <MessagePrimitive.GroupedParts groupBy={groupActivity} indicator="empty">
          {({ part, children }) => {
            switch (part.type) {
              case "group-activity":
                return <ChatActivity indices={part.indices}>{children}</ChatActivity>;
              case "text":
                return <AssistantText text={part.text} />;
              case "reasoning":
                return part.text.trim() ? <ChatReasoningStep text={part.text} /> : null;
              case "data":
                if (part.name === "skill") return <ChatSkillStep name={skillName(part.data)} />;
                return part.name === "blueprint" ? <ChatBlueprint data={part.data} /> : null;
              case "tool-call":
                if (part.toolName === NAVIGATE_TOOL_NAME)
                  return <ChatDestination args={part.args} />;
                return part.approval ? <ChatApproval {...part} /> : <ChatToolStep {...part} />;
              case "indicator":
                return <AssistantThinking />;
              default:
                return null;
            }
          }}
        </MessagePrimitive.GroupedParts>
        <ChatApprovalBulkBar />
      </div>
      <MessageError />
      {(hasText || isLast) && (
        <ActionBarPrimitive.Root
          hideWhenRunning
          className={cn(
            "-ml-2 mt-1 flex transition-opacity focus-within:opacity-100 group-hover/message:opacity-100",
            !isLast && "opacity-0",
          )}
        >
          {hasText && <MessageCopy />}
          {hasText && <MessageFeedback />}
          {isLast && <MessageRegenerate />}
          {hasText && <MessageTime />}
        </ActionBarPrimitive.Root>
      )}
    </MessagePrimitive.Root>
  );
};

/** Renders the current thread message by role. */
export const ChatMessage = () => {
  const role = useAuiState((s) => s.message.role);
  const isEditing = useAuiState((s) => s.message.composer.isEditing);
  if (isEditing) return <EditComposer />;
  return role === "user" ? <UserMessage /> : <AssistantMessage />;
};

import {
  ActionBarPrimitive,
  AuiIf,
  ErrorPrimitive,
  MessagePrimitive,
  type PartState,
  useAuiState,
} from "@assistant-ui/react";
import { ThinkingIndicator } from "@avplatform/assistant-chat";
import { cn } from "@avplatform/ui/lib";
import { CheckIcon, CopyIcon, WarningCircleIcon } from "@phosphor-icons/react";
import { useContext } from "react";

import { ChatThreadMountedAtContext } from "../constants/chat-thread-mounted-at.constant";
import { NAVIGATE_TOOL_NAME } from "../utils/chat-intent.util";
import { ChatActivity, ChatReasoningStep, ChatSkillStep, ChatToolStep } from "./ChatActivity";
import { ChatApproval, ChatApprovalBulkBar } from "./ChatApproval";
import { ChatAttachment } from "./ChatAttachment";
import { ChatBlueprint } from "./ChatBlueprint";
import { ChatDestination } from "./ChatDestination";
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

const AssistantThinking = () => {
  const startedAt = useAuiState((s) => s.message.createdAt);
  return <ThinkingIndicator startedAt={startedAt} className="py-1" />;
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
          <ActionBarPrimitive.Root className="flex opacity-0 transition-opacity focus-within:opacity-100 group-hover/message:opacity-100">
            <MessageCopy />
          </ActionBarPrimitive.Root>
        </>
      )}
    </MessagePrimitive.Root>
  );
};

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
                return part.text.trim() ? <ChatMarkdown /> : null;
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
      {hasText && (
        <ActionBarPrimitive.Root
          hideWhenRunning
          className={cn(
            "-ml-2 mt-1 flex transition-opacity focus-within:opacity-100 group-hover/message:opacity-100",
            !isLast && "opacity-0",
          )}
        >
          <MessageCopy />
        </ActionBarPrimitive.Root>
      )}
    </MessagePrimitive.Root>
  );
};

/** Renders the current thread message by role. */
export const ChatMessage = () => {
  const role = useAuiState((s) => s.message.role);
  return role === "user" ? <UserMessage /> : <AssistantMessage />;
};

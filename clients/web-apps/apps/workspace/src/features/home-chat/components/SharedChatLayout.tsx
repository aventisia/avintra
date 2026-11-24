import { AssistantRuntimeProvider } from "@assistant-ui/react";
import { ChatThread } from "@avplatform/chat";
import { useDocumentTitle } from "@avplatform/ui/hooks";

import { useSharedChat } from "../hooks/useSharedChat.hook";
import { HomeChatSkeleton } from "./HomeChatSkeleton";
import { SharedLinkUnavailable } from "./SharedLinkUnavailable";

/** A shared Home chat as a read-only transcript for signed-in members. */
export const SharedChatLayout = ({ shareToken }: { shareToken: string }) => {
  const { runtime, title, isLoading, isError } = useSharedChat(shareToken);
  useDocumentTitle(title ?? "Shared chat");

  if (isLoading) return <HomeChatSkeleton label="Loading shared chat" />;

  if (isError || !title) return <SharedLinkUnavailable kind="chat" />;

  return (
    <div className="flex h-full min-h-0 flex-col">
      <div className="flex h-12 shrink-0 items-center gap-2 bg-surface px-4 dark:bg-bg">
        <h1 className="truncate text-sm font-medium text-ink">{title}</h1>
        <span className="shrink-0 rounded-full bg-sunken px-2 py-0.5 text-xs text-muted-foreground dark:bg-fill">
          Read-only
        </span>
      </div>
      <div className="min-h-0 flex-1">
        <AssistantRuntimeProvider runtime={runtime}>
          <ChatThread readOnly />
        </AssistantRuntimeProvider>
      </div>
    </div>
  );
};

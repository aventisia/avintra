import { AssistantRuntimeProvider } from "@assistant-ui/react";
import { ChatThread } from "@avplatform/chat";
import { Skeleton } from "@avplatform/ui";
import { useDocumentTitle } from "@avplatform/ui/hooks";
import { Link } from "react-router-dom";

import { useSharedChat } from "../hooks/useSharedChat.hook";

/** A shared Home chat as a read-only transcript for signed-in members. */
export const SharedChatLayout = ({ shareToken }: { shareToken: string }) => {
  const { runtime, title, isLoading, isError } = useSharedChat(shareToken);
  useDocumentTitle(title ?? "Shared chat");

  if (isLoading)
    return (
      <div
        role="status"
        aria-label="Loading shared chat"
        className="mx-auto w-full max-w-3xl space-y-3 p-6"
      >
        <Skeleton className="h-6 w-1/2 rounded" />
        <Skeleton className="h-40 w-full rounded-xl" />
      </div>
    );

  if (isError || !title)
    return (
      <div className="mx-auto flex w-full max-w-3xl flex-col items-center gap-2 p-6 text-center">
        <h1 className="text-base font-medium text-ink">
          This link is invalid or sharing was stopped
        </h1>
        <Link to="/" className="text-sm text-muted-foreground underline">
          Back to Home
        </Link>
      </div>
    );

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

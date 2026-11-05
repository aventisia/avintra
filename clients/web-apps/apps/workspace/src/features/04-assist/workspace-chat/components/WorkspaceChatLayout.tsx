import { Button } from "@avplatform/ui/buttons";
import { useDocumentTitle } from "@avplatform/ui/hooks";
import { cn } from "@avplatform/ui/lib";
import { useUserSessionStore } from "@avplatform/ui/stores";
import { NotePencilIcon } from "@phosphor-icons/react";
import { useState } from "react";
import { useNavigate, useParams, useSearchParams } from "react-router-dom";
import { useShallow } from "zustand/react/shallow";

import { useIsMobile } from "@/hooks/useIsMobile";
import { ResizableHandle, ResizablePanel, ResizablePanelGroup } from "@/react-toolkit/ui/resizable";

import { ConversationDto } from "../dtos/conversation.dto";
import { useLandingConversations } from "../hooks/useLandingConversations.hook";
import {
  WORKSPACE_CHAT_LIST_PANEL_ID,
  WORKSPACE_CHAT_THREAD_PANEL_ID,
  getWorkspaceChatSplit,
  saveWorkspaceChatSplit,
} from "../utils/workspace-chat-split-persistence.util";
import { WorkspaceChatPanel } from "./WorkspaceChatPanel";

const ConversationListItem = ({
  conversation,
  isSelected,
  onSelect,
}: {
  conversation: ConversationDto;
  isSelected: boolean;
  onSelect: (id: string) => void;
}) => (
  <button
    type="button"
    onClick={() => onSelect(conversation.id)}
    className={cn(
      "flex w-full items-center gap-2 rounded-md px-3 py-2 text-left text-sm transition-colors hover:bg-muted",
      isSelected && "bg-muted font-medium",
    )}
  >
    <span className="min-w-0 truncate">{conversation.title}</span>
  </button>
);

/**
 * Renders the landing chat list beside the active thread.
 */
export const WorkspaceChatLayout = () => {
  useDocumentTitle("Chat - Assist");

  const isMobile = useIsMobile();
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const { conversationId } = useParams();

  const userEmail = useUserSessionStore(
    useShallow((state) => state.userSession?.email ?? "anonymous"),
  );
  const [initialSplit] = useState(() => getWorkspaceChatSplit(userEmail));

  const { active, archived } = useLandingConversations();
  const activeConversations = active.data?.data ?? [];
  const archivedConversations = archived.data?.data ?? [];

  const layoutMode = isMobile ? "stacked" : "split";
  const isNewChat = searchParams.get("new") === "1";
  const isThreadActive = Boolean(conversationId) || isNewChat;
  const showList = layoutMode === "split" || !isThreadActive;
  const showThread = layoutMode === "split" || isThreadActive;

  const startNewChat = () => navigate("/assist/chat?new=1");

  const list = (
    <div className="flex min-h-0 flex-1 flex-col overflow-hidden">
      <div className="flex items-center justify-between gap-2 border-b px-3 py-2">
        <p className="text-sm font-semibold">Chats</p>
        <Button variant="ghost" size="icon7" aria-label="New chat" onClick={startNewChat}>
          <NotePencilIcon className="h-4 w-4" />
        </Button>
      </div>
      <div className="flex-1 overflow-y-auto p-1.5">
        {activeConversations.length === 0 && archivedConversations.length === 0 && (
          <p className="px-3 py-6 text-center text-xs text-muted-foreground">
            No conversations yet. Start a new chat.
          </p>
        )}
        {activeConversations.map((conversation) => (
          <ConversationListItem
            key={conversation.id}
            conversation={conversation}
            isSelected={conversation.id === conversationId}
            onSelect={(id) => navigate(`/assist/chat/${id}`)}
          />
        ))}
        {archivedConversations.length > 0 && (
          <>
            <p className="px-3 pb-1 pt-3 text-[10px] font-semibold uppercase tracking-wider text-muted-foreground">
              Archived
            </p>
            {archivedConversations.map((conversation) => (
              <ConversationListItem
                key={conversation.id}
                conversation={conversation}
                isSelected={conversation.id === conversationId}
                onSelect={(id) => navigate(`/assist/chat/${id}`)}
              />
            ))}
          </>
        )}
      </div>
    </div>
  );

  const thread = (
    <div className="flex min-h-0 flex-1 flex-col overflow-hidden">
      {layoutMode === "stacked" && isThreadActive && (
        <div className="border-b px-3 py-2">
          <Button variant="ghost" size="sm" onClick={() => navigate("/assist/chat")}>
            Back to chats
          </Button>
        </div>
      )}
      <div className="min-h-0 flex-1">
        <WorkspaceChatPanel />
      </div>
    </div>
  );

  return (
    <div
      className={cn(
        "flex h-full flex-col space-y-4 md:py-4",
        layoutMode === "stacked" && "h-screen space-y-2",
      )}
    >
      {layoutMode !== "stacked" && (
        <div className="flex w-full items-center justify-between">
          <p className="text-lg font-medium">Chat</p>
        </div>
      )}

      <div
        className={cn(
          "flex h-[calc(100vh-2.5*var(--header-height))] w-full overflow-hidden rounded-lg border",
          layoutMode === "split" ? "bg-slate-200" : "bg-background",
        )}
      >
        {layoutMode === "split" ? (
          <ResizablePanelGroup
            orientation="horizontal"
            defaultLayout={initialSplit ?? undefined}
            onLayoutChanged={(layout, meta) => {
              if (meta.isUserInteraction) saveWorkspaceChatSplit(userEmail, layout);
            }}
            className="min-h-0 flex-1"
          >
            <ResizablePanel
              id={WORKSPACE_CHAT_LIST_PANEL_ID}
              defaultSize="22%"
              minSize="16%"
              collapsible={false}
              className="flex min-h-0 flex-col overflow-hidden bg-background"
            >
              {list}
            </ResizablePanel>

            <ResizableHandle withHandle className="mr-px w-1.5 bg-transparent" />

            <ResizablePanel
              id={WORKSPACE_CHAT_THREAD_PANEL_ID}
              defaultSize="78%"
              minSize="50%"
              collapsible={false}
              className="flex min-h-0 flex-col overflow-hidden bg-background"
            >
              {thread}
            </ResizablePanel>
          </ResizablePanelGroup>
        ) : (
          <>
            <div className={cn("w-full", !showList && "hidden")}>{list}</div>
            <div className={cn("w-full", !showThread && "hidden")}>{thread}</div>
          </>
        )}
      </div>
    </div>
  );
};

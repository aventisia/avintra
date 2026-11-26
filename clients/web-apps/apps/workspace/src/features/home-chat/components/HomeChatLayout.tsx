import {
  ChatHistory,
  ChatIconButton,
  ChatTitle,
  printChat,
  toChatMarkdown,
} from "@avplatform/chat";
import { useDocumentTitle } from "@avplatform/ui/hooks";
import { cn } from "@avplatform/ui/lib";
import { downloadBlob } from "@avplatform/ui/utils";
import { EyeSlashIcon, ShareNetworkIcon } from "@phosphor-icons/react";
import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { toast } from "sonner";

import { getMessages } from "../apis/conversation-message.apis";
import { HOME_CHAT_TEMPORARY_PARAM } from "../constants/home-chat.constant";
import { useHomeChatActiveChat } from "../hooks/useHomeChatActiveChat.hook";
import { useHomeChatHistory } from "../hooks/useHomeChatHistory.hook";
import { useHomeChatHistoryActions } from "../hooks/useHomeChatHistoryActions.hook";
import { useHomeChatHistoryPanel } from "../hooks/useHomeChatHistoryPanel.hook";
import { useHomeChatSession } from "../hooks/useHomeChatSession.hook";
import type { HomeChatActiveChat } from "../types/home-chat-active-chat.type";
import { HomeChatFrame } from "./HomeChatFrame";
import { HomeChatPreferencesDialog } from "./HomeChatPreferencesDialog";
import { HomeChatProjectDialog } from "./HomeChatProjectDialog";
import { HomeChatSharedLinksDialog } from "./HomeChatSharedLinksDialog";
import { HomeChatThread } from "./HomeChatThread";

const exportChat = async ({ id, title }: HomeChatActiveChat) => {
  try {
    const markdown = toChatMarkdown(title, (await getMessages(id)).data);
    const fileName = `${title.replace(/[\\/:*?"<>|]+/g, "-").trim() || "Chat"}.md`;
    downloadBlob(new Blob([markdown], { type: "text/markdown;charset=utf-8" }), fileName);
  } catch {
    toast.error("Couldn't export this chat");
  }
};

/** Lays out Home, the chat-first landing page: the open thread under a bar with its title. */
export const HomeChatLayout = () => {
  useDocumentTitle("Home");
  const { sessionKey, ...session } = useHomeChatSession();
  const navigate = useNavigate();
  const [isPreferencesOpen, setIsPreferencesOpen] = useState(false);
  const [areSharedLinksOpen, setAreSharedLinksOpen] = useState(false);
  const titles = useHomeChatHistory(false);
  const { renameChat, copyShareLink, stopSharing } = useHomeChatHistoryActions();
  const {
    props: historyProps,
    confirmDelete,
    editingProjectId,
    closeProjectDialog,
  } = useHomeChatHistoryPanel();
  const activeChat = useHomeChatActiveChat(session.conversationId, titles.items, titles.isLoading);

  return (
    <>
      <h1 className="sr-only">Home</h1>
      <HomeChatFrame
        onNewChat={() => navigate("/")}
        onOpenPreferences={() => setIsPreferencesOpen(true)}
        header={
          session.isTemporary ? (
            <span className="flex items-center gap-1.5 px-1 text-sm font-medium text-ink">
              <EyeSlashIcon className="size-4 text-muted-foreground" />
              Temporary chat
            </span>
          ) : (
            activeChat && (
              <ChatTitle
                key={activeChat.id}
                title={activeChat.title}
                onRename={(title) => renameChat(activeChat.id, title)}
                onExport={() => void exportChat(activeChat)}
                onExportPdf={() =>
                  printChat(activeChat.title).catch(() => toast.error("Couldn't export this chat"))
                }
                onCopyShareLink={() => void copyShareLink(activeChat.id)}
                onStopSharing={activeChat.isShared ? () => stopSharing(activeChat.id) : undefined}
                onDelete={() => confirmDelete(activeChat)}
              />
            )
          )
        }
        actions={
          <>
            {!session.conversationId && (
              <ChatIconButton
                label={session.isTemporary ? "Turn off temporary chat" : "Start a temporary chat"}
                aria-pressed={session.isTemporary}
                className={cn(session.isTemporary && "bg-hover text-ink")}
                onClick={() =>
                  navigate(session.isTemporary ? "/" : `/?${HOME_CHAT_TEMPORARY_PARAM}=1`)
                }
              >
                <EyeSlashIcon />
              </ChatIconButton>
            )}
            <ChatIconButton label="Shared links" onClick={() => setAreSharedLinksOpen(true)}>
              <ShareNetworkIcon />
            </ChatIconButton>
          </>
        }
        renderHistory={(close) => (
          <ChatHistory {...historyProps} onNewChat={() => navigate("/")} onCollapse={close} />
        )}
      >
        <HomeChatThread key={sessionKey} {...session} />
      </HomeChatFrame>
      <HomeChatPreferencesDialog open={isPreferencesOpen} onOpenChange={setIsPreferencesOpen} />
      <HomeChatProjectDialog projectId={editingProjectId} onClose={closeProjectDialog} />
      <HomeChatSharedLinksDialog open={areSharedLinksOpen} onOpenChange={setAreSharedLinksOpen} />
    </>
  );
};

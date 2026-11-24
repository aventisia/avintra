import { ChatHistory, ChatTitle, printChat, toChatMarkdown } from "@avplatform/chat";
import { useDocumentTitle } from "@avplatform/ui/hooks";
import { downloadBlob } from "@avplatform/ui/utils";
import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { toast } from "sonner";

import { getMessages } from "../apis/conversation-message.apis";
import { useHomeChatActiveChat } from "../hooks/useHomeChatActiveChat.hook";
import { useHomeChatHistory } from "../hooks/useHomeChatHistory.hook";
import { useHomeChatHistoryActions } from "../hooks/useHomeChatHistoryActions.hook";
import { useHomeChatHistoryPanel } from "../hooks/useHomeChatHistoryPanel.hook";
import { useHomeChatSession } from "../hooks/useHomeChatSession.hook";
import type { HomeChatActiveChat } from "../types/home-chat-active-chat.type";
import { HomeChatFrame } from "./HomeChatFrame";
import { HomeChatPreferencesDialog } from "./HomeChatPreferencesDialog";
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
  const titles = useHomeChatHistory(false);
  const { renameChat, copyShareLink, stopSharing } = useHomeChatHistoryActions();
  const { props: historyProps, confirmDelete } = useHomeChatHistoryPanel();
  const activeChat = useHomeChatActiveChat(session.conversationId, titles.items, titles.isLoading);

  return (
    <>
      <h1 className="sr-only">Home</h1>
      <HomeChatFrame
        onNewChat={() => navigate("/")}
        onOpenPreferences={() => setIsPreferencesOpen(true)}
        header={
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
        }
        renderHistory={(close) => (
          <ChatHistory {...historyProps} onNewChat={() => navigate("/")} onCollapse={close} />
        )}
      >
        <HomeChatThread key={sessionKey} {...session} />
      </HomeChatFrame>
      <HomeChatPreferencesDialog open={isPreferencesOpen} onOpenChange={setIsPreferencesOpen} />
    </>
  );
};

import { ChatHistory, type ChatHistoryItem, ChatTitle, toChatMarkdown } from "@avplatform/chat";
import { useDocumentTitle, useShowAlertHandler } from "@avplatform/ui/hooks";
import { downloadBlob } from "@avplatform/ui/utils";
import { useState } from "react";
import { useHref, useNavigate } from "react-router-dom";
import { toast } from "sonner";

import { getMessages } from "../apis/conversation-message.apis";
import { HOME_CHAT_CONVERSATION_ROUTE } from "../constants/home-chat.constant";
import { useHomeChatHistory } from "../hooks/useHomeChatHistory.hook";
import { useHomeChatHistoryActions } from "../hooks/useHomeChatHistoryActions.hook";
import { useHomeChatSession } from "../hooks/useHomeChatSession.hook";
import { HomeChatFrame } from "./HomeChatFrame";
import { HomeChatThread } from "./HomeChatThread";

const conversationHref = (id: string) => `${HOME_CHAT_CONVERSATION_ROUTE}/${id}`;

const exportChat = async ({ id, title }: ChatHistoryItem) => {
  try {
    const markdown = toChatMarkdown(title, (await getMessages(id)).data);
    const fileName = `${title.replace(/[\\/:*?"<>|]+/g, "-").trim() || "Chat"}.md`;
    downloadBlob(new Blob([markdown], { type: "text/markdown;charset=utf-8" }), fileName);
  } catch {
    toast.error("Couldn't export this chat");
  }
};

/** Lays out Home, the chat-first landing page: chat history beside the open thread. */
export const HomeChatLayout = () => {
  useDocumentTitle("Home");
  const { sessionKey, ...session } = useHomeChatSession();
  const navigate = useNavigate();
  const appRoot = useHref("/").replace(/\/$/, "");
  const [showArchived, setShowArchived] = useState(false);
  const history = useHomeChatHistory(showArchived);
  const { renameChat, togglePin, setArchived, deleteChat } = useHomeChatHistoryActions();
  const { showCustomAlertDialog } = useShowAlertHandler();
  const activeChat = history.items.find((item) => item.id === session.conversationId);

  const confirmDelete = (item: ChatHistoryItem) =>
    showCustomAlertDialog({
      isDestructive: true,
      title: "Delete chat?",
      description: `“${item.title}” and its messages will be deleted. This can't be undone.`,
      confirmBtnText: "Delete",
      showLoadingOnConfirm: true,
      confirmActionFn: async () => {
        await deleteChat(item.id);
        if (item.id === session.conversationId) navigate("/", { replace: true });
      },
    });

  return (
    <>
      <h1 className="sr-only">Home</h1>
      <HomeChatFrame
        onNewChat={() => navigate("/")}
        header={
          // shortcut: the title comes from the loaded history pages, so a chat outside them (or filtered out by search) shows no title; add a get-conversation endpoint if that matters.
          activeChat && (
            <ChatTitle
              key={activeChat.id}
              title={activeChat.title}
              onRename={(title) => renameChat(activeChat.id, title)}
              onExport={() => void exportChat(activeChat)}
              onDelete={() => confirmDelete(activeChat)}
            />
          )
        }
        renderHistory={({ close, dismissSheet }) => (
          <ChatHistory
            items={history.items}
            activeId={session.conversationId}
            getHref={(id) => appRoot + conversationHref(id)}
            onOpen={(id) => {
              dismissSheet();
              navigate(conversationHref(id));
            }}
            onNewChat={() => {
              dismissSheet();
              navigate("/");
            }}
            onRename={renameChat}
            onTogglePin={togglePin}
            showArchived={showArchived}
            onShowArchivedChange={setShowArchived}
            onToggleArchive={({ id }) => {
              setArchived(id, !showArchived);
              if (!showArchived && id === session.conversationId) navigate("/", { replace: true });
            }}
            onDelete={confirmDelete}
            onCollapse={close}
            search={history.search}
            onSearchChange={history.setSearch}
            isLoading={history.isLoading}
            isError={history.isError}
            onRetry={history.retry}
            hasMore={history.hasMore}
            isLoadingMore={history.isLoadingMore}
            onLoadMore={history.loadMore}
          />
        )}
      >
        <HomeChatThread key={sessionKey} {...session} />
      </HomeChatFrame>
    </>
  );
};

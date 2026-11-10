import { ChatHistory, type ChatHistoryItem, ChatTitle } from "@avplatform/chat";
import { useDocumentTitle, useShowAlertHandler } from "@avplatform/ui/hooks";
import { useHref, useNavigate } from "react-router-dom";

import { HOME_CHAT_CONVERSATION_ROUTE } from "../constants/home-chat.constant";
import { useHomeChatHistory } from "../hooks/useHomeChatHistory.hook";
import { useHomeChatHistoryActions } from "../hooks/useHomeChatHistoryActions.hook";
import { useHomeChatSession } from "../hooks/useHomeChatSession.hook";
import { HomeChatFrame } from "./HomeChatFrame";
import { HomeChatThread } from "./HomeChatThread";

const conversationHref = (id: string) => `${HOME_CHAT_CONVERSATION_ROUTE}/${id}`;

/** Lays out Home, the chat-first landing page: chat history beside the open thread. */
export const HomeChatLayout = () => {
  useDocumentTitle("Home");
  const { sessionKey, ...session } = useHomeChatSession();
  const navigate = useNavigate();
  const appRoot = useHref("/").replace(/\/$/, "");
  const history = useHomeChatHistory();
  const { renameChat, deleteChat } = useHomeChatHistoryActions();
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

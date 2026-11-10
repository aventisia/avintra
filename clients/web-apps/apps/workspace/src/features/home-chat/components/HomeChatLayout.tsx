import { ChatHistory } from "@avplatform/chat";
import { useShowAlertHandler } from "@avplatform/ui/hooks";
import { useNavigate } from "react-router-dom";

import { HOME_CHAT_CONVERSATION_ROUTE } from "../constants/home-chat.constant";
import { useHomeChatHistory } from "../hooks/useHomeChatHistory.hook";
import { useHomeChatHistoryActions } from "../hooks/useHomeChatHistoryActions.hook";
import { useHomeChatSession } from "../hooks/useHomeChatSession.hook";
import { HomeChatFrame } from "./HomeChatFrame";
import { HomeChatThread } from "./HomeChatThread";

const conversationHref = (id: string) => `${HOME_CHAT_CONVERSATION_ROUTE}/${id}`;

/** Lays out Home, the chat-first landing page: chat history beside the open thread. */
export const HomeChatLayout = () => {
  const { sessionKey, ...session } = useHomeChatSession();
  const navigate = useNavigate();
  const history = useHomeChatHistory();
  const { renameChat, deleteChat } = useHomeChatHistoryActions();
  const { showCustomAlertDialog } = useShowAlertHandler();

  return (
    <>
      <h1 className="sr-only">Home</h1>
      <HomeChatFrame
        onNewChat={() => navigate("/")}
        renderHistory={({ close, dismissSheet }) => (
          <ChatHistory
            items={history.items}
            activeId={session.conversationId}
            getHref={conversationHref}
            onOpen={(id) => {
              dismissSheet();
              navigate(conversationHref(id));
            }}
            onNewChat={() => {
              dismissSheet();
              navigate("/");
            }}
            onRename={renameChat}
            onDelete={(item) =>
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
              })
            }
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

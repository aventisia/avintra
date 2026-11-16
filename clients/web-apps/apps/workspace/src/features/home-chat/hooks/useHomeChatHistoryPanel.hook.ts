import { type ChatHistoryItem, type ChatSidebarHistoryProps } from "@avplatform/chat";
import { useShowAlertHandler } from "@avplatform/ui/hooks";
import { useState } from "react";
import { useHref, useMatch, useNavigate } from "react-router-dom";

import { HOME_CHAT_CONVERSATION_ROUTE } from "../constants/home-chat.constant";
import { useChatProjects } from "./useChatProjects.hook";
import { useHomeChatHistory } from "./useHomeChatHistory.hook";
import { useHomeChatHistoryActions } from "./useHomeChatHistoryActions.hook";

export const homeChatConversationHref = (id: string) => `${HOME_CHAT_CONVERSATION_ROUTE}/${id}`;

/**
 * Everything a chat history list needs: the open chat, search, project and archive filters,
 * and the row actions. Leaving the open chat (archive or delete) returns to a new chat.
 */
export const useHomeChatHistoryPanel = (onNavigate?: () => void) => {
  const navigate = useNavigate();
  const appRoot = useHref("/").replace(/\/$/, "");
  const activeId = useMatch(`${HOME_CHAT_CONVERSATION_ROUTE}/:conversationId`)?.params
    .conversationId;
  const [showArchived, setShowArchived] = useState(false);
  const [projectId, setProjectId] = useState<string | null>(null);
  const history = useHomeChatHistory(showArchived, showArchived ? null : projectId);
  const { renameChat, togglePin, setArchived, deleteChat, moveToProject } =
    useHomeChatHistoryActions();
  const chatProjects = useChatProjects();
  const { showCustomAlertDialog } = useShowAlertHandler();

  const leaveIfOpen = (id: string) => {
    if (id === activeId) navigate("/", { replace: true });
  };

  const confirmDelete = (item: ChatHistoryItem) =>
    showCustomAlertDialog({
      isDestructive: true,
      title: "Delete chat?",
      description: `“${item.title}” and its messages will be deleted. This can't be undone.`,
      confirmBtnText: "Delete",
      showLoadingOnConfirm: true,
      confirmActionFn: async () => {
        await deleteChat(item.id);
        leaveIfOpen(item.id);
      },
    });

  const props: ChatSidebarHistoryProps = {
    items: history.items,
    activeId,
    getHref: (id) => appRoot + homeChatConversationHref(id),
    onOpen: (id) => {
      onNavigate?.();
      navigate(homeChatConversationHref(id));
    },
    onRename: renameChat,
    onTogglePin: togglePin,
    showArchived,
    onShowArchivedChange: setShowArchived,
    onToggleArchive: ({ id }) => {
      setArchived(id, !showArchived);
      if (!showArchived) leaveIfOpen(id);
    },
    onDelete: confirmDelete,
    projects: chatProjects.projects,
    activeProjectId: showArchived ? null : projectId,
    onProjectFilterChange: setProjectId,
    onCreateProject: (name) => chatProjects.createProject(name, setProjectId),
    onMoveToProject: (item, nextProjectId) => moveToProject(item.id, nextProjectId),
    search: history.search,
    onSearchChange: history.setSearch,
    isLoading: history.isLoading,
    isError: history.isError,
    onRetry: history.retry,
    hasMore: history.hasMore,
    isLoadingMore: history.isLoadingMore,
    onLoadMore: history.loadMore,
  };

  return { props, confirmDelete };
};

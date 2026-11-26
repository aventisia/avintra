import { type ChatHistoryProject, type ChatSidebarHistoryProps } from "@avplatform/chat";
import { useShowAlertHandler } from "@avplatform/ui/hooks";
import { useState } from "react";
import { useHref, useMatch, useNavigate } from "react-router-dom";

import { HOME_CHAT_CONVERSATION_ROUTE } from "../constants/home-chat.constant";
import type { HomeChatActiveChat } from "../types/home-chat-active-chat.type";
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
  const [editingProjectId, setEditingProjectId] = useState<string | null>(null);
  const history = useHomeChatHistory(showArchived, showArchived ? null : projectId);
  const {
    renameChat,
    togglePin,
    setArchived,
    deleteChat,
    archiveChats,
    deleteChats,
    moveToProject,
  } = useHomeChatHistoryActions();
  const chatProjects = useChatProjects();
  const { showCustomAlertDialog } = useShowAlertHandler();

  const leaveIfOpen = (id: string) => {
    if (id === activeId) navigate("/", { replace: true });
  };

  const confirmDelete = (item: Pick<HomeChatActiveChat, "id" | "title">) =>
    showCustomAlertDialog({
      isDestructive: true,
      title: "Delete chat?",
      description: `“${item.title}”, its messages and the files made in it will be deleted. You can undo this for a few seconds.`,
      confirmBtnText: "Delete",
      confirmActionFn: () => {
        deleteChat(item.id);
        leaveIfOpen(item.id);
      },
    });

  const leaveIfOpenAmong = (ids: string[]) => {
    if (activeId && ids.includes(activeId)) navigate("/", { replace: true });
  };

  const confirmDeleteMany = (ids: string[], onDone: () => void) =>
    showCustomAlertDialog({
      isDestructive: true,
      title: ids.length === 1 ? "Delete 1 chat?" : `Delete ${ids.length} chats?`,
      description:
        "Their messages and the files made in them will be deleted. You can undo this for a few seconds.",
      confirmBtnText: "Delete",
      confirmActionFn: () => {
        deleteChats(ids);
        leaveIfOpenAmong(ids);
        onDone();
      },
    });

  const confirmDeleteProject = (project: ChatHistoryProject) =>
    showCustomAlertDialog({
      isDestructive: true,
      title: "Delete project?",
      description: `“${project.name}” will be deleted. Its chats stay in your history, ungrouped.`,
      confirmBtnText: "Delete",
      showLoadingOnConfirm: true,
      confirmActionFn: async () => {
        await chatProjects.deleteProject(project.id);
        if (project.id === projectId) setProjectId(null);
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
    onArchiveMany: showArchived
      ? undefined
      : async (ids) => {
          await archiveChats(ids);
          leaveIfOpenAmong(ids);
        },
    onDeleteMany: confirmDeleteMany,
    projects: chatProjects.projects,
    activeProjectId: showArchived ? null : projectId,
    onProjectFilterChange: setProjectId,
    onCreateProject: (name) => chatProjects.createProject(name, setProjectId),
    onRenameProject: chatProjects.renameProject,
    onEditProject: (project) => setEditingProjectId(project.id),
    onDeleteProject: confirmDeleteProject,
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

  return {
    props,
    confirmDelete,
    editingProjectId,
    closeProjectDialog: () => setEditingProjectId(null),
  };
};

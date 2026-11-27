import { type IHttpResponse } from "@avplatform/ui/dtos";
import { type InfiniteData, useMutation, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";

import { deleteWithUndo } from "@/hooks/useDeferredDelete";

import {
  archiveConversations,
  deleteConversation,
  deleteMultipleConversations,
  setConversationArchived,
  shareConversation,
  unshareConversation,
  updateLandingConversationPin,
  updateLandingConversationProject,
  updateLandingConversationTitle,
} from "../apis/conversation.apis";
import {
  HOME_CHAT_CONVERSATION_QUERY_KEY,
  HOME_CHAT_FILES_QUERY_KEY,
  HOME_CHAT_HISTORY_QUERY_KEY,
  HOME_CHAT_SHARED_CHATS_QUERY_KEY,
} from "../constants/home-chat.constant";
import { type ConversationDto } from "../dtos/conversation.dto";
import { type LandingConversationDto } from "../dtos/landing-conversation.dto";
import { type UpdateConversationTitleDto } from "../dtos/update-conversation-title.dto";
import { buildSharedChatLink } from "../utils/shared-link.util";

type HistoryPages = InfiniteData<LandingConversationDto[], number>;

/** Renames (shown at once), pins, archives, shares and deletes (behind an Undo toast) Home chats, one or several at a time, refreshing the history afterwards. */
export const useHomeChatHistoryActions = () => {
  const queryClient = useQueryClient();
  const refreshHistory = () => {
    void queryClient.invalidateQueries({ queryKey: HOME_CHAT_CONVERSATION_QUERY_KEY });
    void queryClient.invalidateQueries({ queryKey: HOME_CHAT_SHARED_CHATS_QUERY_KEY });
    return queryClient.invalidateQueries({ queryKey: HOME_CHAT_HISTORY_QUERY_KEY });
  };

  const rename = useMutation({
    mutationFn: updateLandingConversationTitle,
    onMutate: async ({ id, title }: UpdateConversationTitleDto) => {
      await queryClient.cancelQueries({ queryKey: HOME_CHAT_HISTORY_QUERY_KEY });
      queryClient.setQueriesData<HistoryPages>({ queryKey: HOME_CHAT_HISTORY_QUERY_KEY }, (data) =>
        data
          ? {
              ...data,
              pages: data.pages.map((page) =>
                page.map((item) => (item.id === id ? { ...item, title } : item)),
              ),
            }
          : data,
      );
      queryClient.setQueriesData<IHttpResponse<ConversationDto>>(
        { queryKey: HOME_CHAT_CONVERSATION_QUERY_KEY },
        (response) =>
          response?.data?.id === id ? { ...response, data: { ...response.data, title } } : response,
      );
    },
    onError: () => toast.error("Couldn't rename that chat"),
    onSettled: refreshHistory,
  });

  const pin = useMutation({
    mutationFn: updateLandingConversationPin,
    onError: () => toast.error("Couldn't pin that chat"),
    onSettled: refreshHistory,
  });

  const moveProject = useMutation({
    mutationFn: updateLandingConversationProject,
    onError: () => toast.error("Couldn't move that chat"),
    onSettled: refreshHistory,
  });

  const archive = useMutation({
    mutationFn: setConversationArchived,
    onSuccess: (_, { archived }) =>
      toast.success(archived ? "Chat archived" : "Chat restored", {
        className: "sonner-toaster-sm",
      }),
    onError: (_, { archived }) =>
      toast.error(archived ? "Couldn't archive that chat" : "Couldn't restore that chat"),
    onSettled: refreshHistory,
  });

  const archiveMany = useMutation({
    mutationFn: archiveConversations,
    onSuccess: (_, ids) =>
      toast.success(ids.length === 1 ? "Chat archived" : `${ids.length} chats archived`, {
        className: "sonner-toaster-sm",
      }),
    onError: () => toast.error("Couldn't archive those chats"),
    onSettled: refreshHistory,
  });

  const share = useMutation({
    mutationFn: shareConversation,
    onSettled: () => void refreshHistory(),
  });

  const unshare = useMutation({
    mutationFn: unshareConversation,
    onSuccess: () => toast.success("Sharing stopped"),
    onSettled: () => void refreshHistory(),
  });

  const createShareLink = async (id: string) =>
    buildSharedChatLink((await share.mutateAsync(id)).data);

  const refreshAfterDelete = () => {
    void refreshHistory();
    void queryClient.invalidateQueries({ queryKey: HOME_CHAT_FILES_QUERY_KEY });
  };

  const deleteChat = (id: string) =>
    deleteWithUndo({
      ids: [id],
      message: "Chat deleted",
      failureMessage: "Couldn't delete that chat",
      commit: (config) => deleteConversation(id, config),
      onSettled: refreshAfterDelete,
    });

  const deleteChats = (ids: string[]) =>
    deleteWithUndo({
      ids,
      message: ids.length === 1 ? "Chat deleted" : `${ids.length} chats deleted`,
      failureMessage: "Couldn't delete those chats",
      commit: (config) => deleteMultipleConversations(ids, config),
      onSettled: refreshAfterDelete,
    });

  return {
    renameChat: (id: string, title: string) => rename.mutate({ id, title }),
    togglePin: ({ id, isPinned }: { id: string; isPinned?: boolean }) =>
      pin.mutate({ id, isPinned: !isPinned }),
    moveToProject: (id: string, projectId: string | null) => moveProject.mutate({ id, projectId }),
    setArchived: (id: string, archived: boolean) => archive.mutate({ id, archived }),
    createShareLink,
    stopSharing: async (id: string) => {
      await unshare.mutateAsync(id);
    },
    deleteChat,
    archiveChats: archiveMany.mutateAsync,
    deleteChats,
  };
};

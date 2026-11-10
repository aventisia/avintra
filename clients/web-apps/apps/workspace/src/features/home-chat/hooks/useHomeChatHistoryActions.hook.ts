import { type InfiniteData, useMutation, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";

import { deleteConversation, updateLandingConversationTitle } from "../apis/conversation.apis";
import { HOME_CHAT_HISTORY_QUERY_KEY } from "../constants/home-chat.constant";
import { type LandingConversationDto } from "../dtos/landing-conversation.dto";
import { type UpdateConversationTitleDto } from "../dtos/update-conversation-title.dto";

type HistoryPages = InfiniteData<LandingConversationDto[], number>;

/** Renames (shown at once) and deletes Home chats, refreshing the history afterwards. */
export const useHomeChatHistoryActions = () => {
  const queryClient = useQueryClient();
  const refreshHistory = () =>
    queryClient.invalidateQueries({ queryKey: HOME_CHAT_HISTORY_QUERY_KEY });

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
    },
    onError: () => toast.error("Couldn't rename that chat"),
    onSettled: refreshHistory,
  });

  const remove = useMutation({
    mutationFn: deleteConversation,
    onSuccess: () => toast.success("Chat deleted", { className: "sonner-toaster-sm" }),
    onError: () => toast.error("Couldn't delete that chat"),
    onSettled: refreshHistory,
  });

  return {
    renameChat: (id: string, title: string) => rename.mutate({ id, title }),
    deleteChat: remove.mutateAsync,
  };
};

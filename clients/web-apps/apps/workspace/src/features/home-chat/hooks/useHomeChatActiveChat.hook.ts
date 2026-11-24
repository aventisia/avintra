import { type ChatHistoryItem } from "@avplatform/chat";
import { useQuery } from "@tanstack/react-query";

import { getConversation } from "../apis/conversation.apis";
import { HOME_CHAT_CONVERSATION_QUERY_KEY } from "../constants/home-chat.constant";
import type { HomeChatActiveChat } from "../types/home-chat-active-chat.type";

/** The open chat for the title bar: from the loaded history pages, else fetched by its ID when opened by link or reload. */
export const useHomeChatActiveChat = (
  conversationId: string | undefined,
  historyItems: ChatHistoryItem[],
  isHistoryLoading: boolean,
): HomeChatActiveChat | undefined => {
  const loadedChat = historyItems.find((item) => item.id === conversationId);

  const { data } = useQuery({
    queryKey: [...HOME_CHAT_CONVERSATION_QUERY_KEY, conversationId],
    queryFn: () => getConversation(conversationId!),
    enabled: !!conversationId && !loadedChat && !isHistoryLoading,
    retry: false,
    staleTime: 30_000,
  });

  if (loadedChat) return loadedChat;
  const conversation = data?.data;
  if (!conversation?.title.trim()) return undefined;
  return { id: conversation.id, title: conversation.title };
};

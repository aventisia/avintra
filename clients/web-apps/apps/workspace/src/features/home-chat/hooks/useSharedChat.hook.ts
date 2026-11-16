import { type ChatModelAdapter, useLocalRuntime } from "@assistant-ui/react";
import { createConversationHistoryAdapter } from "@avplatform/chat";
import { useQuery } from "@tanstack/react-query";
import { useRef, useState } from "react";

import { getSharedMessages } from "../apis/conversation-message.apis";
import { getSharedConversation } from "../apis/conversation.apis";

const readOnlyAdapter: ChatModelAdapter = {
  async *run() {
    yield { content: [{ type: "text", text: "Shared chats are read-only." }] };
  },
};

/** Loads a shared Home chat and builds its read-only runtime once both halves arrive. */
export const useSharedChat = (shareToken: string) => {
  const chat = useQuery({
    queryKey: ["shared-chat", shareToken],
    queryFn: async () => ({
      conversation: (await getSharedConversation(shareToken)).data,
      messages: (await getSharedMessages(shareToken)).data,
    }),
    retry: false,
    staleTime: 30_000,
  });

  const messagesRef = useRef(chat.data?.messages ?? []);
  messagesRef.current = chat.data?.messages ?? [];
  const [history] = useState(() =>
    createConversationHistoryAdapter(shareToken, async () => messagesRef.current),
  );
  const runtime = useLocalRuntime(readOnlyAdapter, { adapters: { history } });

  return {
    runtime,
    title: chat.data?.conversation.title,
    isLoading: chat.isPending,
    isError: chat.isError,
  };
};

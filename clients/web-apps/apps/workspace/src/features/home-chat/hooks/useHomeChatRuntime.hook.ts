import { useLocalRuntime } from "@assistant-ui/react";
import {
  type ChatDestination,
  type ChatModelSelection,
  createAssistantUIModelAdapter,
} from "@avplatform/assistant-chat";
import {
  createChatAttachmentAdapter,
  createConversationHistoryAdapter,
  createConversationIdAllocator,
  withAttachmentText,
} from "@avplatform/chat";
import { useQueryClient } from "@tanstack/react-query";
import { useEffect, useRef, useState } from "react";
import { toast } from "sonner";

import { getSpaceHeaders } from "@/utils/space-headers";

import { getMessages } from "../apis/conversation-message.apis";
import { createConversation } from "../apis/conversation.apis";
import { HOME_CHAT_HISTORY_QUERY_KEY } from "../constants/home-chat.constant";

type HomeChatRuntimeInput = {
  conversationId?: string;
  onConversationCreated: (conversationId: string) => void;
  onConversationMissing: () => void;
  /** Read on every send; null lets the server pick the tenant's default model. */
  getModelSelection: () => ChatModelSelection | null;
  /** Pages the assistant may send the user to, read on every send. */
  getDestinations: () => readonly ChatDestination[];
};

/**
 * Builds the runtime for one Home thread: replies stream from the landing chat,
 * the conversation is created on the first send, an existing one loads its
 * history, and images, PDFs and text files can be attached.
 */
export const useHomeChatRuntime = ({
  conversationId,
  onConversationCreated,
  onConversationMissing,
  getModelSelection,
  getDestinations,
}: HomeChatRuntimeInput) => {
  const isMountedRef = useRef(false);
  useEffect(() => {
    isMountedRef.current = true;
    return () => {
      isMountedRef.current = false;
    };
  }, []);

  const queryClient = useQueryClient();
  const isHistoryFreshRef = useRef(false);
  // The server titles and reorders the chat as the turn starts, so the history refreshes on the first reply text and again once the turn ends.
  const refreshHistory = (onlyOncePerTurn: boolean) => {
    if (onlyOncePerTurn && isHistoryFreshRef.current) return;
    isHistoryFreshRef.current = onlyOncePerTurn;
    void queryClient.invalidateQueries({ queryKey: HOME_CHAT_HISTORY_QUERY_KEY });
  };

  const [adapter] = useState(() =>
    withAttachmentText(
      createAssistantUIModelAdapter({
        getConversationId: createConversationIdAllocator({
          conversationId,
          createConversation: async () => (await createConversation()).data.id,
          onConversationCreated: (createdId) => {
            if (isMountedRef.current) onConversationCreated(createdId);
          },
        }),
        getExtraHeaders: getSpaceHeaders,
        getModelSelection,
        getDestinations,
        onTextDelta: () => refreshHistory(true),
        onRunFinished: () => refreshHistory(false),
      }),
    ),
  );

  const [attachments] = useState(() => createChatAttachmentAdapter());

  const [history] = useState(() =>
    createConversationHistoryAdapter(conversationId, async (id) => {
      try {
        return (await getMessages(id)).data;
      } catch {
        toast.error("Couldn't open that chat");
        onConversationMissing();
        return [];
      }
    }),
  );

  return useLocalRuntime(adapter, { adapters: { history, attachments } });
};

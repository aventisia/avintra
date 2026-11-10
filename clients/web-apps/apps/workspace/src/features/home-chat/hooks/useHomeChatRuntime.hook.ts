import { useLocalRuntime } from "@assistant-ui/react";
import { createAssistantUIModelAdapter } from "@avplatform/assistant-chat";
import { createConversationHistoryAdapter, createConversationIdAllocator } from "@avplatform/chat";
import { useEffect, useRef, useState } from "react";
import { toast } from "sonner";

import { getSpaceHeaders } from "@/utils/space-headers";

import { getMessages } from "../apis/conversation-message.apis";
import { createConversation } from "../apis/conversation.apis";

type HomeChatRuntimeInput = {
  conversationId?: string;
  onConversationCreated: (conversationId: string) => void;
  onConversationMissing: () => void;
};

/**
 * Builds the runtime for one Home thread: replies stream from the landing chat,
 * the conversation is created on the first send, and an existing one loads its history.
 */
export const useHomeChatRuntime = ({
  conversationId,
  onConversationCreated,
  onConversationMissing,
}: HomeChatRuntimeInput) => {
  const isMountedRef = useRef(false);
  useEffect(() => {
    isMountedRef.current = true;
    return () => {
      isMountedRef.current = false;
    };
  }, []);

  const [adapter] = useState(() =>
    createAssistantUIModelAdapter({
      getConversationId: createConversationIdAllocator({
        conversationId,
        createConversation: async () => (await createConversation()).data.id,
        onConversationCreated: (createdId) => {
          if (isMountedRef.current) onConversationCreated(createdId);
        },
      }),
      getExtraHeaders: getSpaceHeaders,
    }),
  );

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

  return useLocalRuntime(adapter, { adapters: { history } });
};

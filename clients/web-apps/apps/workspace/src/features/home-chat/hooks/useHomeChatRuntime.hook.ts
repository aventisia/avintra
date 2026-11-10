import { useLocalRuntime } from "@assistant-ui/react";
import { type ChatModelSelection, createAssistantUIModelAdapter } from "@avplatform/assistant-chat";
import {
  createChatAttachmentAdapter,
  createConversationHistoryAdapter,
  createConversationIdAllocator,
  withAttachmentText,
} from "@avplatform/chat";
import { useEffect, useRef, useState } from "react";
import { toast } from "sonner";

import { getSpaceHeaders } from "@/utils/space-headers";

import { getMessages } from "../apis/conversation-message.apis";
import { createConversation } from "../apis/conversation.apis";

type HomeChatRuntimeInput = {
  conversationId?: string;
  onConversationCreated: (conversationId: string) => void;
  onConversationMissing: () => void;
  /** Read on every send; null lets the server pick the tenant's default model. */
  getModelSelection: () => ChatModelSelection | null;
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
}: HomeChatRuntimeInput) => {
  const isMountedRef = useRef(false);
  useEffect(() => {
    isMountedRef.current = true;
    return () => {
      isMountedRef.current = false;
    };
  }, []);

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

import { ExportedMessageRepository, type ThreadHistoryAdapter } from "@assistant-ui/react";
import {
  type ConversationMessageLike,
  groupConversationMessages,
} from "@avplatform/assistant-chat";

/**
 * Loads a persisted conversation into the thread. Appends are ignored because
 * the streaming pipeline already stores every turn.
 */
export const createConversationHistoryAdapter = (
  conversationId: string | undefined,
  loadMessages: (conversationId: string) => Promise<readonly ConversationMessageLike[]>,
): ThreadHistoryAdapter => ({
  load: async () =>
    conversationId
      ? ExportedMessageRepository.fromArray(
          groupConversationMessages(await loadMessages(conversationId)),
        )
      : { messages: [] },
  append: async () => {},
});

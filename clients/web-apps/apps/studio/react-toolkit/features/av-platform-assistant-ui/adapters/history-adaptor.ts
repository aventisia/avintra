import {
  ExportedMessageRepository,
  ExportedMessageRepositoryItem,
  ThreadHistoryAdapter,
  ThreadMessage,
} from "@assistant-ui/react";
import { groupConversationMessages } from "@avplatform/assistant-chat";

import { getConversationMessages } from "../apis/assist-conversations-apis";

/**
 * Binds assistant-ui message logs to your backend tables.
 *
 * Persisted rows are grouped into user/assistant messages and their structured
 * content (skills, tool calls, approvals) is rebuilt from the recorded frame
 * transcript, so a reloaded thread matches the streamed one.
 *
 * @param getConversationId Lazy dynamic getter to fetch or create the DB identifier.
 */
export const createHistoryAdapter = (
  getConversationId: (allocateIfMissing: boolean) => Promise<string | undefined>,
): ThreadHistoryAdapter => {
  return {
    async load(): Promise<ExportedMessageRepository> {
      try {
        // Only LOAD historical data. Do NOT trigger a lazy allocation.
        // If there's no ID yet, the thread is inherently empty.
        const threadId = await getConversationId(false);
        if (!threadId) return { messages: [] };

        const res = await getConversationMessages(threadId);
        const data = res?.data ?? [];

        if (data.length === 0) {
          return { messages: [] };
        }

        const threadMessages = groupConversationMessages(data) as unknown as ThreadMessage[];

        const messages = threadMessages.map((msg, index) => ({
          message: msg,
          parentId: index === 0 ? null : threadMessages[index - 1].id,
        }));

        return { messages };
      } catch (err) {
        console.error("Failed to load historical conversation records:", err);
        return { messages: [] };
      }
    },

    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    async append(_item: ExportedMessageRepositoryItem): Promise<void> {
      // Load-only history adapter.
      //
      // Message persistence is owned by the llmpipeline /chat/completions
      // streaming path (it writes the user + assistant + tool messages to
      // run_ConversationMessages as it streams). Writing again here would
      // create duplicate rows, so append is intentionally a no-op.
      return;
    },
  };
};

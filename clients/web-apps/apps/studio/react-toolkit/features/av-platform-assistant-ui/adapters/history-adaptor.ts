/* eslint-disable @typescript-eslint/no-explicit-any */
import {
  ExportedMessageRepository,
  ExportedMessageRepositoryItem,
  ThreadHistoryAdapter,
  ThreadMessage,
} from "@assistant-ui/react";

import { getConversationMessages } from "../apis/assist-conversations-apis";
import {
  ConversationMessageDto,
  ConversationMessageSenderEnum,
} from "../dtos/conversation-message-dto";

/**
 * Binds assistant-ui message logs to your backend tables.
 * @param getConversationId Lazy dynamic getter to fetch or create the DB identifier.
 */
export const createHistoryAdapter = (
  getConversationId: (allocateIfMissing: boolean) => Promise<string | undefined>,
): ThreadHistoryAdapter => {
  const mapRole = (role: ConversationMessageSenderEnum): ThreadMessage["role"] => {
    switch (role) {
      case ConversationMessageSenderEnum.USER:
        return "user";
      case ConversationMessageSenderEnum.ASSISTANT:
        return "assistant";
      case ConversationMessageSenderEnum.SYSTEM:
        return "system";
      default:
        return "assistant";
    }
  };

  const mapDtoToThreadMessage = (msg: ConversationMessageDto): ThreadMessage => {
    const role = mapRole(msg.role);

    const base = {
      id: msg.id ?? "",
      createdAt: new Date(msg.createdOn),
    };

    if (role === "assistant") {
      return {
        ...base,
        role: "assistant",
        status: { type: "complete", reason: "unknown" },
        metadata: (msg.metadata || {}) as any,
        content: [{ type: "text", text: msg.content }],
      };
    }

    if (role === "user") {
      return {
        ...base,
        role: "user",
        attachments: [],
        metadata: (msg.metadata || { custom: {} }) as any,
        content: [{ type: "text", text: msg.content }],
      };
    }

    return {
      ...base,
      role: "system",
      metadata: (msg.metadata || { custom: {} }) as any,
      content: [{ type: "text", text: msg.content }],
    };
  };

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

        const threadMessages = data.map(mapDtoToThreadMessage);

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
      // worc_ConversationMessages as it streams). Writing again here would
      // create duplicate rows, so append is intentionally a no-op.
      return;
    },
  };
};

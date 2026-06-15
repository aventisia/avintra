/* eslint-disable @typescript-eslint/no-explicit-any */
import {
  ExportedMessageRepository,
  ExportedMessageRepositoryItem,
  ThreadHistoryAdapter,
  ThreadMessage,
} from "@assistant-ui/react";

import {
  getConversationMessages,
  insertConversationMessage,
} from "../apis/assist-conversations-apis";
import {
  ConversationMessageDto,
  ConversationMessageSenderEnum,
} from "../dtos/conversation-message-dto";

/**
 * Binds assistant-ui message logs to your backend tables.
 * @param getConversationId Lazy dynamic getter to fetch or create the DB identifier.
 * @param flowVersionId Context marker for the active logic flow.
 * @param isReadOnly If true, prevents appending new data to the database.
 */
export const createHistoryAdapter = (
  getConversationId: (
    allocateIfMissing: boolean,
  ) => Promise<string | undefined>,
  flowVersionId: string,
  isReadOnly: boolean,
): ThreadHistoryAdapter => {
  const mapRole = (
    role: ConversationMessageSenderEnum,
  ): ThreadMessage["role"] => {
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

  const mapToDtoRole = (
    role: ThreadMessage["role"],
  ): ConversationMessageSenderEnum => {
    switch (role) {
      case "user":
        return ConversationMessageSenderEnum.USER;
      case "assistant":
        return ConversationMessageSenderEnum.ASSISTANT;
      case "system":
        return ConversationMessageSenderEnum.SYSTEM;
    }
  };

  const extractText = (msg: ThreadMessage): string => {
    for (const part of msg.content ?? []) {
      if (part.type === "text") return part.text;
    }
    return "";
  };

  const mapDtoToThreadMessage = (
    msg: ConversationMessageDto,
  ): ThreadMessage => {
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

  // Takes dynamic threadId now
  const mapThreadToDto = (
    msg: ThreadMessage,
    threadId: string,
  ): ConversationMessageDto => ({
    conversationId: threadId,
    flowVersionId,
    content: extractText(msg),
    role: mapToDtoRole(msg.role),
    metadata: msg.metadata as Record<string, unknown>,
    files: null,
    createdOn: msg.createdAt
      ? msg.createdAt.toISOString()
      : new Date().toISOString(),
  });

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

    async append(item: ExportedMessageRepositoryItem): Promise<void> {
      if (isReadOnly) {
        console.warn(
          "History Adapter: Attempted to append in readOnly mode. Action blocked.",
        );
        return;
      }

      try {
        // Enforce lazy allocation. If the user hits enter and an ID doesn't exist, generate one now.
        const threadId = await getConversationId(true);
        if (!threadId) return; // Silent fail (applies to temporary mode which skips DB logic entirely)

        const msg = item.message;
        if (!msg) return;

        const dto = mapThreadToDto(msg, threadId);
        await insertConversationMessage(dto);
      } catch (err) {
        console.error("Failed to append communication log:", err);
      }
    },
  };
};

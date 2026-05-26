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
} from "../../apis/assist-conversations-apis";
import {
  ConversationMessageDto,
  ConversationMessageSenderEnum,
} from "../../dtos/conversation-message-dto";

/**
 * Factory so we can pass threadId
 */
export const createHistoryAdapter = (
  threadId: string,
  flowVersionId: string,
): ThreadHistoryAdapter => {
  /**
   * Role mapping
   */
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

  const extractText = (msg: ThreadMessage) => {
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
        status: { type: "complete", reason: "stop" },
        metadata: msg.metadata as any,
        content: [{ type: "text", text: msg.content }],
      };
    }

    if (role === "user") {
      return {
        ...base,
        role: "user",
        attachments: [],
        metadata: { custom: {} },
        content: [{ type: "text", text: msg.content }],
      };
    }

    return {
      ...base,
      role: "system",
      metadata: { custom: {} },
      content: [{ type: "text", text: msg.content }],
    };
  };

  const mapThreadToDto = (msg: ThreadMessage): ConversationMessageDto => ({
    conversationId: threadId||null,
    flowVersionId,
    content: extractText(msg),
    role: mapToDtoRole(msg.role),
    metadata: msg.metadata as any,
    files: null,
    createdOn: msg.createdAt.toISOString(),
  });

  return {
    /**
     * LOAD (no params!)
     */
    async load(): Promise<ExportedMessageRepository> {
      try {
        const res = await getConversationMessages(threadId);
        const data = res?.data ?? [];

        //  Treat empty thread correctly
        if (data.length === 0) {
          return { messages: [] };
        }
        const threadMessages = data.map(mapDtoToThreadMessage);

        //  Convert to repository items
        const messages = threadMessages.map((msg, index) => ({
          message: msg,
          parentId: index === 0 ? null : threadMessages[index - 1].id,
        }));

        return {
          messages,
        };
      } catch (err) {
        console.error(" load failed", err);
        return { messages: [] };
      }
    },
    /**
     * APPEND (single item)
     */
    async append(item: ExportedMessageRepositoryItem): Promise<void> {
      try {
        const msg = item.message;

        if (!msg) return;

        const dto = mapThreadToDto(msg);

        await insertConversationMessage(dto);
      } catch (err) {
        console.error(" append failed", err);
      }
    },
  };
};

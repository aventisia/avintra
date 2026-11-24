import { type FeedbackAdapter, useLocalRuntime } from "@assistant-ui/react";
import {
  type ChatDestination,
  type ChatModelSelection,
  createAssistantUIModelAdapter,
} from "@avplatform/assistant-chat";
import {
  type ChatMention,
  createChatAttachmentAdapter,
  createConversationHistoryAdapter,
  createConversationIdAllocator,
  withAttachmentText,
} from "@avplatform/chat";
import { useQueryClient } from "@tanstack/react-query";
import { useEffect, useRef, useState } from "react";
import { toast } from "sonner";

import { getChatArtifact } from "@/features/04-assist/workspace-chat/apis/workspace-chat.apis";
import { getSpaceHeaders } from "@/utils/space-headers";

import { getMessages, setMessageFeedback } from "../apis/conversation-message.apis";
import { createConversation } from "../apis/conversation.apis";
import { HOME_CHAT_HISTORY_QUERY_KEY } from "../constants/home-chat.constant";
import { withMentionedFiles } from "../utils/mentioned-files.util";

type HomeChatRuntimeInput = {
  conversationId?: string;
  /** A temporary chat sends its earlier turns with each message and is never saved. */
  isTemporary?: boolean;
  onConversationCreated: (conversationId: string) => void;
  onConversationMissing: () => void;
  /** Read on every send; null lets the server pick the tenant's default model. */
  getModelSelection: () => ChatModelSelection | null;
  /** Pages the assistant may send the user to, read on every send. */
  getDestinations: () => readonly ChatDestination[];
  /** Files the user can `@`-mention, read on every send. */
  getMentions: () => readonly ChatMention[];
  /** Receives each finished reply's full text. */
  onReplyComplete: (text: string) => void;
};

/**
 * Builds the runtime for one Home thread: replies stream from the landing chat,
 * the conversation is created on the first send, an existing one loads its
 * history, and images, PDFs and text files can be attached.
 */
export const useHomeChatRuntime = ({
  conversationId,
  isTemporary = false,
  onConversationCreated,
  onConversationMissing,
  getModelSelection,
  getDestinations,
  getMentions,
  onReplyComplete,
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

  // User turns the server holds; a run that starts from fewer is a regenerate or edit.
  const storedUserTurnsRef = useRef(0);
  const getKeepUserTurns = (priorUserTurns: number) => {
    const keep = priorUserTurns < storedUserTurnsRef.current ? priorUserTurns : undefined;
    storedUserTurnsRef.current = priorUserTurns + 1;
    return keep;
  };

  const [getConversationId] = useState(() =>
    createConversationIdAllocator({
      conversationId,
      createConversation: async () => (await createConversation()).data.id,
      onConversationCreated: (createdId) => {
        if (isMountedRef.current) onConversationCreated(createdId);
      },
    }),
  );

  const [adapter] = useState(() =>
    withMentionedFiles(
      withAttachmentText(
        createAssistantUIModelAdapter({
          getConversationId,
          isTempChat: isTemporary,
          getExtraHeaders: getSpaceHeaders,
          getModelSelection,
          getDestinations,
          getKeepUserTurns: isTemporary ? undefined : getKeepUserTurns,
          onTextDelta: () => refreshHistory(true),
          onTextComplete: onReplyComplete,
          onRunFinished: () => refreshHistory(false),
        }),
      ),
      {
        getMentions,
        loadFile: async (id) => {
          const file = (await getChatArtifact(id)).data;
          return { name: file.name, contentType: file.contentType, dataUrl: file.blobPath };
        },
        onLoadFailed: (name) => toast.error(`Couldn't read ${name}; sent without it`),
      },
    ),
  );

  const [attachments] = useState(() => createChatAttachmentAdapter());

  const [history] = useState(() =>
    createConversationHistoryAdapter(conversationId, async (id) => {
      try {
        const messages = (await getMessages(id)).data;
        storedUserTurnsRef.current = messages.filter(
          (message) => message.role.toLowerCase() === "user",
        ).length;
        return messages;
      } catch {
        toast.error("Couldn't open that chat");
        onConversationMissing();
        return [];
      }
    }),
  );

  const runtimeRef = useRef<ReturnType<typeof useLocalRuntime>>();
  const [feedback] = useState<FeedbackAdapter>(() => ({
    submit: ({ message, type }) => {
      const messages = runtimeRef.current?.thread.getState().messages ?? [];
      const index = messages.findIndex((candidate) => candidate.id === message.id);
      const userTurn = messages.slice(0, index).filter((m) => m.role === "user").length - 1;
      void getConversationId(false)
        .then((id) => {
          if (!id || userTurn < 0) throw new Error("No stored reply to rate");
          return setMessageFeedback(id, userTurn, type);
        })
        .catch(() => toast.error("Couldn't save your feedback"));
    },
  }));

  const runtime = useLocalRuntime(adapter, { adapters: { history, attachments, feedback } });
  runtimeRef.current = runtime;
  return runtime;
};

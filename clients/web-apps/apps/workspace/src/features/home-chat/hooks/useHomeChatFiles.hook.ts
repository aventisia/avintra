import { type ChatFile, type ChatFileHandlers, chatFileSize, findChatFile } from "@avplatform/chat";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { useState } from "react";
import { toast } from "sonner";

import {
  createChatArtifact,
  getChatArtifacts,
} from "@/features/04-assist/workspace-chat/apis/workspace-chat.apis";
import { type ChatArtifactDto } from "@/features/04-assist/workspace-chat/dtos/chat-artifact.dto";

import { HOME_CHAT_FILES_QUERY_KEY } from "../constants/home-chat.constant";

const fileKey = (file: Pick<ChatFile, "contentType">, sizeBytes: number) =>
  `${file.contentType}:${sizeBytes}`;

/**
 * Stores the files Home's replies produce as chat artifacts and resolves each
 * reply's file to its stored copy. Files are matched back by type and size, so renamed files still match.
 */
export const useHomeChatFiles = (
  conversationId: string | undefined,
  onOpenFile: (id: string) => void,
) => {
  const queryClient = useQueryClient();
  const queryKey = [...HOME_CHAT_FILES_QUERY_KEY, conversationId];
  const { data: stored = [] } = useQuery({
    queryKey,
    queryFn: async () => (await getChatArtifacts(conversationId!)).data ?? [],
    enabled: !!conversationId,
  });
  const [savingKeys, setSavingKeys] = useState<ReadonlySet<string>>(new Set());

  const resolveFile: ChatFileHandlers["resolveFile"] = (file) => {
    const sizeBytes = chatFileSize(file.body);
    const match = stored.find((item) => fileKey(item, item.sizeBytes) === fileKey(file, sizeBytes));
    if (match) return { id: match.id };
    return savingKeys.has(fileKey(file, sizeBytes)) ? "saving" : null;
  };

  const saveFromReply = (forConversationId: string | undefined, text: string) => {
    const file = findChatFile(text);
    if (!forConversationId || !file?.isComplete || !file.body) return;
    const sizeBytes = chatFileSize(file.body);
    const key = fileKey(file, sizeBytes);
    const listKey = [...HOME_CHAT_FILES_QUERY_KEY, forConversationId];
    const current = queryClient.getQueryData<ChatArtifactDto[]>(listKey) ?? [];
    if (current.some((item) => fileKey(item, item.sizeBytes) === key)) return;

    setSavingKeys((keys) => new Set(keys).add(key));
    // shortcut: the browser stores the file as a data URL (393's approach); move the save server-side with the next 393 slice.
    createChatArtifact({
      conversationId: forConversationId,
      name: file.name,
      contentType: file.contentType,
      sizeBytes,
      blobPath: `data:${file.contentType};charset=utf-8,${encodeURIComponent(file.body)}`,
      sourceArtifact: null,
      origin: "Generated",
    })
      .then(({ data }) => {
        if (!data) throw new Error("No artifact returned");
        queryClient.setQueryData<ChatArtifactDto[]>(listKey, (items = []) => [...items, data]);
      })
      .catch(() => toast.error(`Couldn't save ${file.name}. It's shown as code instead.`))
      .finally(() =>
        setSavingKeys((keys) => {
          const next = new Set(keys);
          next.delete(key);
          return next;
        }),
      );
  };

  return { handlers: { resolveFile, onOpenFile } satisfies ChatFileHandlers, saveFromReply };
};

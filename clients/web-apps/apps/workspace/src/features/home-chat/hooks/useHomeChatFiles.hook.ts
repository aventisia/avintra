import { type ChatFileHandlers, chatFileSize, findChatFile } from "@avplatform/chat";
import { useQuery, useQueryClient } from "@tanstack/react-query";

import { getChatArtifacts } from "@/features/04-assist/workspace-chat/apis/workspace-chat.apis";

import { HOME_CHAT_FILES_QUERY_KEY } from "../constants/home-chat.constant";

/**
 * Resolves each reply's file to the copy the server stored as a chat artifact.
 * Files are matched back by name, type and size, so each reply opens its own version.
 */
export const useHomeChatFiles = (
  conversationId: string | undefined,
  onOpenFile: (id: string) => void,
) => {
  const queryClient = useQueryClient();
  const { data: stored = [], isFetching } = useQuery({
    queryKey: [...HOME_CHAT_FILES_QUERY_KEY, conversationId],
    queryFn: async () => (await getChatArtifacts(conversationId!)).data ?? [],
    enabled: !!conversationId,
  });

  const resolveFile: ChatFileHandlers["resolveFile"] = (file) => {
    const sizeBytes = chatFileSize(file.body);
    const candidates = stored.filter(
      (item) => item.name === file.name && item.contentType === file.contentType,
    );
    const match =
      candidates.find((item) => item.sizeBytes === sizeBytes) ??
      stored.find((item) => item.contentType === file.contentType && item.sizeBytes === sizeBytes);
    if (match) return { id: match.id };
    return isFetching ? "saving" : null;
  };

  const refreshAfterReply = (text: string) => {
    if (findChatFile(text)?.isComplete)
      void queryClient.invalidateQueries({ queryKey: HOME_CHAT_FILES_QUERY_KEY });
  };

  return {
    handlers: { resolveFile, onOpenFile } satisfies ChatFileHandlers,
    refreshAfterReply,
    artifacts: stored,
  };
};

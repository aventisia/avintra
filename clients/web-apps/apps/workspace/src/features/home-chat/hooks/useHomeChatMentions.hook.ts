import { type ChatMention } from "@avplatform/chat";
import { FileTextIcon } from "@phosphor-icons/react";
import { useQuery } from "@tanstack/react-query";
import { useMemo } from "react";

import { getAllChatArtifacts } from "@/features/04-assist/workspace-chat/apis/workspace-chat.apis";
import { latestArtifacts } from "@/features/04-assist/workspace-chat/utils/workspace-chat-artifact-filter.util";

import { HOME_CHAT_FILES_QUERY_KEY } from "../constants/home-chat.constant";

/** Every file the user can `@`-mention in the Home composer, one row per file name. */
export const useHomeChatMentions = () => {
  const artifacts = useQuery({
    queryKey: [...HOME_CHAT_FILES_QUERY_KEY, "all"],
    queryFn: getAllChatArtifacts,
    staleTime: 60_000,
  });

  const mentions = useMemo<ChatMention[]>(
    () =>
      latestArtifacts(artifacts.data?.data ?? []).map((artifact) => ({
        id: artifact.id,
        label: artifact.name,
        description: artifact.conversationTitle ?? "Chat file",
        icon: FileTextIcon,
      })),
    [artifacts.data],
  );

  return mentions;
};

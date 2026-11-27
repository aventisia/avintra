import { useQuery, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";

import {
  getAllChatArtifacts,
  shareChatArtifact,
  unshareChatArtifact,
} from "@/features/04-assist/workspace-chat/apis/workspace-chat.apis";
import {
  WORKSPACE_CHAT_ALL_ARTIFACTS_KEY,
  WORKSPACE_CHAT_ARTIFACTS_KEY,
} from "@/features/04-assist/workspace-chat/hooks/useWorkspaceChatArtifacts.hook";

import { getLandingConversations } from "../apis/conversation.apis";
import {
  HOME_CHAT_FILES_QUERY_KEY,
  HOME_CHAT_SHARED_CHATS_QUERY_KEY,
} from "../constants/home-chat.constant";
import { buildSharedFileLink } from "../utils/shared-link.util";
import { useHomeChatHistoryActions } from "./useHomeChatHistoryActions.hook";

/** The most shared chats the Shared links dialog lists, most recent first. */
export const SHARED_CHATS_LIMIT = 100;

/** The user's shared Home chats and files, with copy-link and stop-sharing actions for each. */
export const useHomeChatSharedLinks = (isEnabled: boolean) => {
  const queryClient = useQueryClient();
  const { createShareLink, stopSharing } = useHomeChatHistoryActions();

  const chats = useQuery({
    queryKey: HOME_CHAT_SHARED_CHATS_QUERY_KEY,
    queryFn: () =>
      getLandingConversations({
        archived: false,
        shared: true,
        skip: 0,
        take: SHARED_CHATS_LIMIT,
      }),
    enabled: isEnabled,
  });
  const files = useQuery({
    queryKey: WORKSPACE_CHAT_ALL_ARTIFACTS_KEY,
    queryFn: getAllChatArtifacts,
    enabled: isEnabled,
  });

  const refreshFiles = () => {
    void queryClient.invalidateQueries({ queryKey: HOME_CHAT_FILES_QUERY_KEY });
    void queryClient.invalidateQueries({ queryKey: WORKSPACE_CHAT_ARTIFACTS_KEY });
  };

  const copyChatLink = async (id: string) => {
    try {
      await navigator.clipboard.writeText(await createShareLink(id));
      toast.success("Read-only link copied");
    } catch {
      toast.error("Couldn't copy the share link");
    }
  };

  const stopSharingChat = async (id: string) => {
    try {
      await stopSharing(id);
    } catch {
      toast.error("Couldn't stop sharing");
    }
  };

  const copyFileLink = async (artifactId: string) => {
    try {
      const token = (await shareChatArtifact(artifactId)).data;
      await navigator.clipboard.writeText(buildSharedFileLink(token));
      toast.success("Read-only link copied");
    } catch {
      toast.error("Couldn't copy the share link");
    }
  };

  const stopSharingFile = async (artifactId: string) => {
    try {
      await unshareChatArtifact(artifactId);
      toast.success("Sharing stopped");
    } catch {
      toast.error("Couldn't stop sharing");
    }
    refreshFiles();
  };

  const sharedChats = chats.data?.data ?? [];

  return {
    chats: sharedChats,
    hasMoreChats: sharedChats.length >= SHARED_CHATS_LIMIT,
    files: (files.data?.data ?? []).filter((artifact) => artifact.isShared),
    isLoading: chats.isLoading || files.isLoading,
    isError: chats.isError || files.isError,
    copyChatLink: (id: string) => void copyChatLink(id),
    stopSharingChat: (id: string) => void stopSharingChat(id),
    copyFileLink: (id: string) => void copyFileLink(id),
    stopSharingFile: (id: string) => void stopSharingFile(id),
  };
};

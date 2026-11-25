import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";

import { getAllChatArtifacts, updateChatArtifact } from "../apis/workspace-chat.apis";

/** Query key root for the workspace chat artifact gallery. */
export const WORKSPACE_CHAT_ARTIFACTS_KEY = ["workspace-chat-artifacts"] as const;

/** Query key for every stored artifact, shared by the gallery and Home's shared links. */
export const WORKSPACE_CHAT_ALL_ARTIFACTS_KEY = [...WORKSPACE_CHAT_ARTIFACTS_KEY, "all"] as const;

/**
 * Fetches every stored artifact for the current tenant, space, and user.
 */
export const useWorkspaceChatArtifacts = () => {
  const queryClient = useQueryClient();
  const all = useQuery({
    queryKey: WORKSPACE_CHAT_ALL_ARTIFACTS_KEY,
    queryFn: getAllChatArtifacts,
  });
  const onSuccess = () => queryClient.invalidateQueries({ queryKey: WORKSPACE_CHAT_ARTIFACTS_KEY });
  const renameArtifact = useMutation({ mutationFn: updateChatArtifact, onSuccess });

  return { all, renameArtifact };
};

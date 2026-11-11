import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";

import {
  deleteChatArtifact,
  deleteMultipleChatArtifacts,
  getAllChatArtifacts,
} from "../apis/workspace-chat.apis";

/** Query key root for the workspace chat artifact gallery. */
export const WORKSPACE_CHAT_ARTIFACTS_KEY = ["workspace-chat-artifacts"] as const;

/**
 * Fetches every stored artifact for the current tenant, space, and user.
 */
export const useWorkspaceChatArtifacts = () => {
  const queryClient = useQueryClient();
  const all = useQuery({
    queryKey: [...WORKSPACE_CHAT_ARTIFACTS_KEY, "all"],
    queryFn: getAllChatArtifacts,
  });
  const onSuccess = () => queryClient.invalidateQueries({ queryKey: WORKSPACE_CHAT_ARTIFACTS_KEY });
  const deleteArtifact = useMutation({ mutationFn: deleteChatArtifact, onSuccess });
  const deleteArtifacts = useMutation({ mutationFn: deleteMultipleChatArtifacts, onSuccess });

  return { all, deleteArtifact, deleteArtifacts };
};

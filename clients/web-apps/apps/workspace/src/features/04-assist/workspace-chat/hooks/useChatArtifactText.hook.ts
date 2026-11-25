import { readDataUrl } from "@avplatform/chat";
import { useQueryClient } from "@tanstack/react-query";

import { getChatArtifact } from "../apis/workspace-chat.apis";

/** Gives a loader for one stored artifact's text, cached under the given key, or null when it holds no inline text. */
export const useChatArtifactText = (queryKeyPrefix: readonly unknown[]) => {
  const queryClient = useQueryClient();
  return async (id: string) => {
    const artifact = await queryClient.fetchQuery({
      queryKey: [...queryKeyPrefix, id],
      queryFn: async () => (await getChatArtifact(id)).data,
    });
    return readDataUrl(artifact.blobPath);
  };
};

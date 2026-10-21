import { toast } from "@avplatform/ui/sonner";
import { useMutation, useQueryClient } from "@tanstack/react-query";

import { restoreUiBuilderVersion } from "../apis/ui-builder.apis";
import { UI_BUILDER_VERSIONS_QUERY_KEY } from "./useUiBuilderProject.hook";

/** Restores a builder version as the new head and refreshes the version list. */
export const useRestoreUiBuilderVersion = (projectId: string) => {
  const queryClient = useQueryClient();

  const restoreMutation = useMutation({
    mutationFn: (versionNumber: number) => restoreUiBuilderVersion(projectId, versionNumber),
    onSuccess: () =>
      queryClient.invalidateQueries({
        queryKey: [...UI_BUILDER_VERSIONS_QUERY_KEY, projectId],
      }),
    onError: (error) => toast.error(String(error)),
  });

  return { restoreMutation };
};

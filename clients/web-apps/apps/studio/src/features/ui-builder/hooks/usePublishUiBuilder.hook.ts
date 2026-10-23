import { toast } from "@avplatform/ui/sonner";
import { useMutation, useQueryClient } from "@tanstack/react-query";

import { publishUiBuilderProject } from "../apis/ui-builder.apis";
import { UI_BUILDER_PROJECT_QUERY_KEY } from "./useUiBuilderProject.hook";

/** Publishes a custom UI builder project and refreshes its studio project data. */
export const usePublishUiBuilder = (projectId: string) => {
  const queryClient = useQueryClient();

  const publishMutation = useMutation({
    mutationFn: () => publishUiBuilderProject(projectId),

    onSuccess: (httpResponse) => {
      toast.success(httpResponse?.message ?? "Project published successfully.");
      queryClient.invalidateQueries({ queryKey: [...UI_BUILDER_PROJECT_QUERY_KEY, projectId] });
    },

    onError: (error) => {
      toast.error(String(error));
    },
  });

  return { publishMutation };
};

import { toast } from "@avplatform/ui/sonner";
import { useMutation, useQueryClient } from "@tanstack/react-query";

import { updateUiBuilderProjectSettings } from "../apis/ui-builder.apis";
import { type UiBuilderProjectSettingsDto } from "../dtos/ui-builder-dto";
import { UI_BUILDER_PROJECT_QUERY_KEY } from "./useUiBuilderProject.hook";

/**
 * Saves the owner-managed project settings (instructions, theme, template flag) and refreshes the project.
 */
export const useUiBuilderProjectSettings = (projectId: string) => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (settings: UiBuilderProjectSettingsDto) =>
      updateUiBuilderProjectSettings(projectId, settings),
    onSuccess: () => {
      toast.success("Project settings saved.");
      void queryClient.invalidateQueries({
        queryKey: [...UI_BUILDER_PROJECT_QUERY_KEY, projectId],
      });
    },
    onError: (error) => toast.error(`The project settings could not be saved. ${String(error)}`),
  });
};

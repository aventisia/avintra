import { toast } from "@avplatform/ui/sonner";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";

import { cloneUiBuilderProject, getUiBuilderTemplates } from "../apis/ui-builder-table-apis";
import { UI_BUILDER_QUERY_KEY } from "../constants";
import { UiBuilderTableDto } from "../dtos/ui-builder-table-dto";

const UI_BUILDER_TEMPLATES_QUERY_KEY = ["ui-builder-templates"];

/**
 * Lists the tenant's UI builder templates.
 */
export const useFetchUiBuilderTemplates = (enabled: boolean) =>
  useQuery({
    queryKey: UI_BUILDER_TEMPLATES_QUERY_KEY,
    queryFn: getUiBuilderTemplates,
    enabled,
    staleTime: 60_000,
  });

/**
 * Creates a project from a template and refreshes the project list.
 */
export const useCloneUiBuilderMutation = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ templateId, project }: { templateId: string; project: UiBuilderTableDto }) =>
      cloneUiBuilderProject(templateId, project),
    onSuccess: (httpResponse) => {
      toast.success(httpResponse?.message ?? "Project created from the template.");
      queryClient.invalidateQueries({ queryKey: UI_BUILDER_QUERY_KEY });
    },
    onError: (error) => toast.error(error.toString()),
  });
};

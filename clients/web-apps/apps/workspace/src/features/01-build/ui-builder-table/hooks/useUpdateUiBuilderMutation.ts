import { toast } from "@avplatform/ui/sonner";
import { useMutation, useQueryClient } from "@tanstack/react-query";

import { updateUiBuilderProject } from "../apis/ui-builder-table-apis";
import {
  MY_INTERFACES_QUERY_KEY,
  PUBLISHED_AGENTS_QUERY_KEY,
  UI_BUILDER_QUERY_KEY,
} from "../constants";

/**
 * Updates a UI builder project and refreshes the build, published, and assigned lists.
 */
export const useUpdateUiBuilderMutation = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: updateUiBuilderProject,

    onSuccess: (httpResponse) => {
      toast.success(httpResponse?.message ?? "Project updated successfully.");
      queryClient.invalidateQueries({ queryKey: UI_BUILDER_QUERY_KEY });
      queryClient.invalidateQueries({ queryKey: PUBLISHED_AGENTS_QUERY_KEY });
      queryClient.invalidateQueries({ queryKey: MY_INTERFACES_QUERY_KEY });
    },

    onError: (error) => {
      toast.error(error.toString());
    },
  });
};

import { toast } from "@avplatform/ui/sonner";
import { useMutation, useQueryClient } from "@tanstack/react-query";

import { insertUiBuilderProjectUser } from "../apis/ui-builder-users-apis";
import {
  MY_INTERFACES_QUERY_KEY,
  PUBLISHED_AGENTS_QUERY_KEY,
  UI_BUILDER_QUERY_KEY,
  UI_BUILDER_USER_KEY,
} from "../constants";

/**
 * Assigns a user (or all team members) to a UI builder project.
 */
export const useAssignUiBuilderUserMutation = (uiBuilderProjectId: string) => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: insertUiBuilderProjectUser,

    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [UI_BUILDER_USER_KEY, uiBuilderProjectId] });
      queryClient.invalidateQueries({ queryKey: UI_BUILDER_QUERY_KEY });
      queryClient.invalidateQueries({ queryKey: PUBLISHED_AGENTS_QUERY_KEY });
      queryClient.invalidateQueries({ queryKey: MY_INTERFACES_QUERY_KEY });
      toast.success("Assigned User(s) successfully.");
    },

    onError: (error) => {
      toast.error(error.toString());
    },
  });
};

import { toast } from "@avplatform/ui/sonner";
import { useMutation, useQueryClient } from "@tanstack/react-query";

import { deleteUiBuilderProjectUser } from "../apis/ui-builder-users-apis";
import { UI_BUILDER_USER_KEY } from "../constants";

/**
 * Removes a user assignment from a UI builder project.
 */
export const useRemoveUiBuilderUserMutation = (uiBuilderProjectId: string) => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: deleteUiBuilderProjectUser,

    onSuccess: (res) => {
      queryClient.invalidateQueries({ queryKey: [UI_BUILDER_USER_KEY, uiBuilderProjectId] });
      toast.success(res.message);
    },

    onError: (error) => {
      toast.error(error.toString());
    },
  });
};

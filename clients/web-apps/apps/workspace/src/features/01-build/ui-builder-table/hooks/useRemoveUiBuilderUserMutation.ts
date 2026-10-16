import { toast } from "@avplatform/ui/sonner";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { useShallow } from "zustand/react/shallow";

import { deleteUiBuilderProjectUser } from "../apis/ui-builder-users-apis";
import { UI_BUILDER_USER_KEY } from "../constants";
import { useUiBuilderUsersStore } from "../stores/ui-builder-users-store";

/**
 * Removes a user assignment from a UI builder project.
 */
export const useRemoveUiBuilderUserMutation = () => {
  const queryClient = useQueryClient();

  const { uiBuilderProjectId } = useUiBuilderUsersStore(
    useShallow((s) => ({
      uiBuilderProjectId: s.uiBuilderProjectId,
    })),
  );

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

import { toast } from "@avplatform/ui/sonner";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { useShallow } from "zustand/react/shallow";

import { deletePublishedUiUser } from "../apis/published-uis-apis";
import { PUBLISHED_UI_USER_KEY } from "../constants";
import { usePublishedUiStore } from "../stores/published-ui-store";

/**
 * Removes a user assignment from a published UI builder project.
 */
export const useRemovePublishedUiUser = () => {
  const queryClient = useQueryClient();

  const { uiBuilderProjectId } = usePublishedUiStore(
    useShallow((state) => ({
      uiBuilderProjectId: state.uiBuilderProjectId,
    })),
  );

  return useMutation({
    mutationFn: deletePublishedUiUser,

    onSuccess: (res) => {
      queryClient.invalidateQueries({ queryKey: [PUBLISHED_UI_USER_KEY, uiBuilderProjectId] });
      toast.success(res.message);
    },

    onError: (error) => {
      toast.error(error.toString());
    },
  });
};

import { toast } from "@avplatform/ui/sonner";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { useShallow } from "zustand/react/shallow";

import { insertPublishedUiUser } from "../apis/published-uis-apis";
import {
  DATA_QUERY_KEY,
  MY_INTERFACES_QUERY_KEY,
  PUBLISHED_UI_USER_KEY,
  UI_BUILDER_QUERY_KEY,
} from "../constants";
import { usePublishedUiStore } from "../stores/published-ui-store";

/**
 * Assigns a user (or all team members) to a published UI builder project.
 */
export const useAssignPublishedUiUser = () => {
  const queryClient = useQueryClient();

  const { uiBuilderProjectId } = usePublishedUiStore(
    useShallow((state) => ({
      uiBuilderProjectId: state.uiBuilderProjectId,
    })),
  );

  return useMutation({
    mutationFn: insertPublishedUiUser,

    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [PUBLISHED_UI_USER_KEY, uiBuilderProjectId] });
      queryClient.invalidateQueries({ queryKey: DATA_QUERY_KEY });
      queryClient.invalidateQueries({ queryKey: UI_BUILDER_QUERY_KEY });
      queryClient.invalidateQueries({ queryKey: MY_INTERFACES_QUERY_KEY });
      toast.success("Assigned User(s) successfully.");
    },

    onError: (error) => {
      toast.error(error.toString());
    },
  });
};

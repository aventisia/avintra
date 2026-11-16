import { toast } from "@avplatform/ui/sonner";
import { useMutation, useQueryClient } from "@tanstack/react-query";

import { updatePublishedUiStatus } from "../apis/published-uis-apis";
import { DATA_QUERY_KEY, MY_INTERFACES_QUERY_KEY, UI_BUILDER_QUERY_KEY } from "../constants";

/**
 * Disables or enables a published UI builder project and refreshes the affected lists.
 */
export const useUpdatePublishedUi = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: updatePublishedUiStatus,

    onSuccess: (httpResponse) => {
      toast.success(httpResponse?.message ?? "Interface updated successfully.");
      queryClient.invalidateQueries({ queryKey: DATA_QUERY_KEY });
      queryClient.invalidateQueries({ queryKey: UI_BUILDER_QUERY_KEY });
      queryClient.invalidateQueries({ queryKey: MY_INTERFACES_QUERY_KEY });
    },

    onError: (error) => {
      toast.error(error.toString());
    },
  });
};

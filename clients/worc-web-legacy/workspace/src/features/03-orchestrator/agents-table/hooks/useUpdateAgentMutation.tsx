import { toast } from "@aventisia/ui/sonner";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { useShallow } from "zustand/react/shallow";

import { updateAgent } from "../apis/agents-table-apis";
import { DATA_QUERY_KEY } from "../constants";
import { useDisableAgentStore } from "../stores/disable-agent-store";

export const useUpdateAgentMutation = () => {
  // // Get the query client for cache management
  const queryClient = useQueryClient();

  const { setShowDialog } = useDisableAgentStore(
    useShallow((s) => ({
      setShowDialog: s.setShowDialog,
    })),
  );

  return useMutation({
    // Function that triggers the API call
    mutationFn: updateAgent,

    // Called on successful mutation
    onSuccess: (httpResponse) => {
      toast.success(httpResponse?.message, {
        className: "sonner-toaster-sm",
      });
      queryClient.invalidateQueries({ queryKey: DATA_QUERY_KEY });
      queryClient.invalidateQueries({ queryKey: ["archive-flows"] });
    },

    // Called on mutation error
    onError: (error) => {
      toast.error(error.toString());
    },

    // Always called at the end (success or error)
    onSettled: () => {
      setShowDialog(false); // Close the dialog after submit attempt
    },
  });
};

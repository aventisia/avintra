import { toast } from "@avplatform/ui/sonner";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { useShallow } from "zustand/react/shallow";

import { uploadWorkItem } from "../apis/queues-table-apis";
import { useQueueUploadItemsStore } from "../stores/queues-upload-item-store";
import { useTableTab } from "./useTableTab";

export const useUploadItemMutation = () => {
  // // Get the query client for cache management
  const queryClient = useQueryClient();

  // Use this in place DATA_QUERY_KEY to handle Personal/Shared tabs list
  const { queryKey } = useTableTab();

  const { setUploadedItems } = useQueueUploadItemsStore(
    useShallow((state) => ({
      setUploadedItems: state.setUploadedItems,
    })),
  );
  return useMutation({
    // Function that triggers the API call
    mutationFn: uploadWorkItem,

    // Called on successful mutation
    onSuccess: (httpResponse) => {
      toast.success(httpResponse?.message, {
        className: "sonner-toaster-sm",
      });
      queryClient.invalidateQueries({ queryKey: queryKey });
      // queryClient.invalidateQueries({ queryKey: ["archive-flows"] });
      setUploadedItems(JSON.parse(httpResponse.data.payloadData || "[]"));
    },

    // Called on mutation error
    onError: (error) => {
      toast.error(error.toString());
    },

    // Always called at the end (success or error)
    onSettled: () => {},
  });
};

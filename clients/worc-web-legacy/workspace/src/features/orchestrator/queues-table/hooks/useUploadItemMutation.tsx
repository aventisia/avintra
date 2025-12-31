import { toast } from "@aventisia/ui/sonner";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { useShallow } from "zustand/react/shallow";

import { uploadWorkItem } from "../apis/queues-table-apis";
import { DATA_QUERY_KEY } from "../constants";
import { useQueueUploadItemsStore } from "../stores/queues-upload-item-store";

export const useUploadItemMutation = () => {
  // // Get the query client for cache management
  const queryClient = useQueryClient();
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
      queryClient.invalidateQueries({ queryKey: DATA_QUERY_KEY });
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

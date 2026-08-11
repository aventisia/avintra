import { toast } from "@avplatform/ui/sonner";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { useNavigate, useSearchParams } from "react-router-dom";

import { getNextQueuesWorkItem } from "../apis/queues-table-apis";
import { DATA_QUERY_KEY, EVENT_QUERY_KEY } from "../constants";

/**
 * Claims the next available work item for the current queue (FIFO mode).
 * On success, navigates to the claimed work item's detail view.
 */
export const useGetNextItemMutation = () => {
  const queryClient = useQueryClient();
  const navigate = useNavigate();

  const [searchParams] = useSearchParams();
  const queueId = searchParams.get("qid");

  return useMutation({
    mutationFn: () => getNextQueuesWorkItem(queueId ?? ""),

    onSuccess: (res) => {
      const workItem = res?.data;
      if (!workItem?.id) {
        toast.error(res?.message || "No work items available.");
        return;
      }

      toast.success(res?.message || "Work item claimed.");
      // Invalidate the current queue's work-item list and open the claimed item.
      queryClient.invalidateQueries({ queryKey: [...DATA_QUERY_KEY, queueId] });
      queryClient.invalidateQueries({ queryKey: [EVENT_QUERY_KEY, workItem.id] });
      navigate(`/assist/queues?qid=${queueId}&wid=${workItem.id}`);
    },

    onError: (error) => {
      toast.error(error.toString());
    },
  });
};

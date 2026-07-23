import { toast } from "@avplatform/ui/sonner";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { useSearchParams } from "react-router-dom";

import { updateQueuesWorkItem } from "../apis/queues-table-apis";
import { DATA_QUERY_KEY, EVENT_QUERY_KEY } from "../constants";

export const useUpdateWorkItemMutation = () => {
  const queryClient = useQueryClient();

  const [searchParams] = useSearchParams();
  const queueId = searchParams.get("qid");
  const workItemId = searchParams.get("wid");

  return useMutation({
    mutationFn: updateQueuesWorkItem,

    onSuccess: async (res) => {
      queryClient.invalidateQueries({
        queryKey: [...DATA_QUERY_KEY, queueId],
      }); //
      queryClient.invalidateQueries({
        queryKey: [...DATA_QUERY_KEY, workItemId],
      }); //
      queryClient.invalidateQueries({
        queryKey: [EVENT_QUERY_KEY, workItemId],
      });
      toast.success(res.message);
    },

    onError: (error) => {
      toast.error(error.toString());
    },
  });
};

import { toast } from "@avplatform/ui/sonner";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { useNavigate, useSearchParams } from "react-router-dom";

import { routeQueuesWorkItem } from "../apis/queues-table-apis";
import { DATA_QUERY_KEY, EVENT_QUERY_KEY } from "../constants";
import { useQueueBackLink } from "./useQueueBackLink";

export const useRouteWorkItemMutation = () => {
  const queryClient = useQueryClient();
  const navigate = useNavigate();
  const backToList = useQueueBackLink();

  const [searchParams] = useSearchParams();
  const queueId = searchParams.get("qid");
  const workItemId = searchParams.get("wid");

  return useMutation({
    mutationFn: routeQueuesWorkItem,

    onSuccess: async () => {
      queryClient.invalidateQueries({
        queryKey: [...DATA_QUERY_KEY, queueId],
      });
      queryClient.invalidateQueries({
        queryKey: [...DATA_QUERY_KEY, workItemId],
      });
      queryClient.invalidateQueries({
        queryKey: [EVENT_QUERY_KEY, workItemId],
      });

      navigate(backToList);
    },

    onError: (error) => {
      toast.error(error.toString());
    },
  });
};

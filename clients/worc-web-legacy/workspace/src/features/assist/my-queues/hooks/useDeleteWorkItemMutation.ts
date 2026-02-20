import { toast } from "@aventisia/ui/sonner";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { useSearchParams } from "react-router-dom";

import { deleteQueuesWorkItem } from "../apis/queues-table-apis";
import { DATA_QUERY_KEY } from "../constants";

export const useDeleteWorkItemMutation = () => {
  const queryClient = useQueryClient();

  const [searchParams] = useSearchParams();
  const queueIDParam = searchParams.get("qid");

  const { mutate: deleteJobMutation, isPending } = useMutation({
    mutationFn: deleteQueuesWorkItem,

    onSuccess: async (res) => {
      queryClient.invalidateQueries({
        queryKey: [...DATA_QUERY_KEY, queueIDParam],
      }); //
      toast.success(res.message);
    },

    onError: (error) => {
      toast.error(error.toString());
    },
  });

  return { deleteJobMutation, isPending };
};

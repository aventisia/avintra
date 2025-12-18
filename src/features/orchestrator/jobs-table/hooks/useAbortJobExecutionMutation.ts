import { toast } from "@aventisia/ui/sonner";
import { useMutation, useQueryClient } from "@tanstack/react-query";

import { abortJobExecution } from "../apis/jobs-table-apis";

export const useAbortJobExecutionMutation = () => {
  const queryClient = useQueryClient();

  const { mutate: abortJobMutation, isPending } = useMutation({
    mutationFn: abortJobExecution,

    onSuccess: async (res) => {
      queryClient.invalidateQueries({ queryKey: ["jobs"] }); // Jobs list
      toast.success(res.message);
    },

    onError: (error) => {
      toast.error(error.toString());
    },
  });

  return { abortJobMutation, isPending };
};

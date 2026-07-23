import { toast } from "@avplatform/ui/sonner";
import { useMutation, useQueryClient } from "@tanstack/react-query";

import { abortJobExecution } from "@/features/execute-flow/apis/job-trigger-apis";

export const useAbortJobExecutionMutation = () => {
  const queryClient = useQueryClient();

  const { mutate: abortJobMutation, isPending } = useMutation({
    mutationFn: abortJobExecution,

    onSuccess: async (res) => {
      toast.success(res.message);
      queryClient.invalidateQueries({ queryKey: ["jobs"] }); // Jobs list
    },

    onError: (error) => {
      toast.error(error.toString());
    },
  });

  return { abortJobMutation, isPending };
};

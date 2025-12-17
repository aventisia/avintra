import { toast } from "@aventisia/ui/sonner";
import { useMutation, useQueryClient } from "@tanstack/react-query";

import { updateJobData } from "@/features/execute-flow/apis/job-trigger-apis";

export const useUpdateJobMutation = () => {
  const queryClient = useQueryClient();

  const { mutate: updateJobMutation, isPending } = useMutation({
    mutationFn: updateJobData,

    onSuccess: async (res) => {
      toast.success(res.message);
      queryClient.invalidateQueries({ queryKey: ["jobs"] }); // Jobs list
    },

    onError: (error) => {
      toast.error(error.toString());
    },
  });

  return { updateJobMutation, isPending };
};

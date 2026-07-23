import { toast } from "@avplatform/ui/sonner";
import { useMutation, useQueryClient } from "@tanstack/react-query";

import { insertJob } from "../apis/jobs-table-apis";

export const useCreateJobMutation = () => {
  const queryClient = useQueryClient();

  const { mutate: createJobMutation, isPending } = useMutation({
    mutationFn: insertJob,

    onSuccess: async (res) => {
      toast.success(res.message);
      queryClient.invalidateQueries({ queryKey: ["jobs"] }); // Jobs list
    },

    onError: (error) => {
      toast.error(error.toString());
    },
  });

  return { createJobMutation, isPending };
};

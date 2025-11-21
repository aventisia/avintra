import { toast } from "@aventisia/ui/sonner";
import { useMutation } from "@tanstack/react-query";

import { insertJob } from "../apis/jobs-table-apis";

export const useCreateJobMutation = () => {
  const { mutate: createJobMutation, isPending } = useMutation({
    mutationFn: insertJob,

    onSuccess: async (res) => {
      toast.success(res.message);
    },

    onError: (error) => {
      toast.error(error.toString());
    },
  });

  return { createJobMutation, isPending };
};

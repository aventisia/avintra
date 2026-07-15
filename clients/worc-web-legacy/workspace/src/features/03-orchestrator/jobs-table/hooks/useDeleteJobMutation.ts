import { toast } from "@aventisia/ui/sonner";
import { useMutation, useQueryClient } from "@tanstack/react-query";

import { deleteJob } from "..";

export const useDeleteJobMutation = () => {
  const queryClient = useQueryClient();

  const { mutate: deleteJobMutation, isPending } = useMutation({
    mutationFn: deleteJob,

    onSuccess: async (res) => {
      queryClient.invalidateQueries({ queryKey: ["jobs"] }); // Jobs list
      toast.success(res.message);
    },

    onError: (error) => {
      toast.error(error.toString());
    },
  });

  return { deleteJobMutation, isPending };
};

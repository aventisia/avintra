import { toast } from "@avplatform/ui/sonner";
import { useMutation, useQueryClient } from "@tanstack/react-query";

import { insertJob } from "../apis/jobs-table-apis";

/**
 *  Custom hook to handle the insertion of a new job using React Query's useMutation.
 *  It provides a mutation function to insert a job and manages the loading state.
 *  On successful insertion, it invalidates the jobs query to refresh the jobs list and shows a success toast.
 *  On error, it shows an error toast with the error message.
 * @returns An object containing the insertJobMutation function and the isPending state.
 */
export const useInsertJobMutation = () => {
  const queryClient = useQueryClient();

  const { mutate: insertJobMutation, isPending } = useMutation({
    mutationFn: insertJob,

    onSuccess: async (res) => {
      queryClient.invalidateQueries({ queryKey: ["jobs"] }); // Jobs list
      toast.success(res.message);
    },

    onError: (error) => {
      toast.error(error.toString());
    },
  });

  return { insertJobMutation, isPending };
};

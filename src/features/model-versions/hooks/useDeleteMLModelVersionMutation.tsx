import { toast } from "@aventisia/ui/sonner";
import { useMutation, useQueryClient } from "@tanstack/react-query";

import { deleteMLModelVersion } from "../apis/model-version-apis";
import { DATA_QUERY_KEY } from "../constants";

export const useDeleteMLModelVersionMutation = () => {
  const queryClient = useQueryClient();

  const { isPending, mutate } = useMutation({
    mutationFn: deleteMLModelVersion,
    onSuccess: (httpResponse) => {
      // Only if you absolutely need immediate refetch regardless of component state
      queryClient.refetchQueries({ queryKey: DATA_QUERY_KEY });

      // Success message
      toast.success(httpResponse?.message, {
        className: "sonner-toaster-sm",
      });
    },
    onError: (error) => {
      // Show error toast
      toast.error(error.toString());
    },
  });
  return {
    isPending,
    mutate,
  };
};

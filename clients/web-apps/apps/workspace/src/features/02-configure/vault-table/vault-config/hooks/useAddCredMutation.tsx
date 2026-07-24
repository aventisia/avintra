import { toast } from "@avplatform/ui/sonner";
import { useMutation, useQueryClient } from "@tanstack/react-query";

import { insertVault } from "../../apis/vaults-table-apis";
import { useTableTab } from "../../hooks/useTableTab";

export const useAddCredMutation = () => {
  // Use this in place DATA_QUERY_KEY to handle Personal/Shared tabs list
  const { queryKey } = useTableTab();

  // // Get the query client for cache management
  const queryClient = useQueryClient();

  return useMutation({
    // API call to insert cred
    mutationFn: insertVault,

    // Show error toast if the mutation fails
    onError: (error) => {
      toast.error(error.toString());
    },
    onSuccess: (httpResponse) => {
      toast.success(httpResponse?.message, {
        className: "sonner-toaster-sm",
      });
      queryClient.invalidateQueries({
        queryKey: queryKey,
      });
    },
  });
};

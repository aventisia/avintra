import { toast } from "@aventisia/ui/sonner";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { useShallow } from "zustand/react/shallow";

import { insertVault } from "../../apis/vaults-table-apis";
import { useTableTab } from "../../hooks/useTableTab";
import { useVaultDialogStore } from "../../stores/vault-dialog-store";

export const useAddCredMutation = () => {
  // Use this in place DATA_QUERY_KEY to handle Personal/Shared tabs list
  const { queryKey } = useTableTab();

  // // Get the query client for cache management
  const queryClient = useQueryClient();
  const { setShowDialog } = useVaultDialogStore(
    useShallow((state) => ({
      setShowDialog: state.setShowDialog,
    })),
  );

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
      setShowDialog(false);
      queryClient.invalidateQueries({
        queryKey: queryKey,
      });
    },
  });
};

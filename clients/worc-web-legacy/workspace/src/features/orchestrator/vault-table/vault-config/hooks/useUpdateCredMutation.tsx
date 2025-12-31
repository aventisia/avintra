import { toast } from "@aventisia/ui/sonner";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { useShallow } from "zustand/react/shallow";

import { updateVault } from "../../apis/vaults-table-apis";
import { DATA_QUERY_KEY } from "../../constants";
import { useVaultDialogStore } from "../../stores/vault-dialog-store";

export const useUpdateCredMutation = () => {
  // // Get the query client for cache management
  const queryClient = useQueryClient();

  const { setShowDialog } = useVaultDialogStore(
    useShallow((state) => ({
      setShowDialog: state.setShowDialog,
    })),
  );

  return useMutation({
    // API call to update cred
    mutationFn: updateVault,

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
        queryKey: DATA_QUERY_KEY,
      });
    },
  });
};

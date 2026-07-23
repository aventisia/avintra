import { DeleteDDMenuItem } from "@avplatform/ui/dropdown-menu";
import { useListOptimisticMutation, useShowAlertHandler } from "@avplatform/ui/hooks";

import { vaultOptimisticMutationFn } from "../../apis/vaults-table-apis";
import { VaultsTableDto } from "../../dtos/vaults-table-dto";
import { useTableTab } from "../../hooks/useTableTab";

interface VaultRowDeleteActionProps {
  rowId: string;
}

export const VaultRowDeleteAction = ({ rowId }: VaultRowDeleteActionProps) => {
  // Get showAlert handler
  const { showCustomAlertDialog } = useShowAlertHandler();
  // Use this in place DATA_QUERY_KEY to handle Personal/Shared tabs list
  const { queryKey } = useTableTab();

  // Get mutation function to delete the config
  const { mutate: deleteConfig } = useListOptimisticMutation<
    string,
    VaultsTableDto | boolean,
    VaultsTableDto
  >([rowId], vaultOptimisticMutationFn, queryKey);

  // Return Delete alert dialog trigger
  return (
    <DeleteDDMenuItem
      onClick={() => {
        showCustomAlertDialog({
          confirmActionFn: () =>
            deleteConfig({
              payload: rowId,
              crudAction: "delete",
            }),
          confirmBtnText: "Yes, delete credential",
          title: "Delete credential?",
          description:
            "Are you sure you want to delete credential? This may break any agent that use it.",
        });
      }}
    />
  );
};

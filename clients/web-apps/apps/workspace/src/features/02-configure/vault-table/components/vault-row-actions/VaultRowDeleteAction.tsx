import { DeleteDDMenuItem } from "@avplatform/ui/dropdown-menu";
import { useListOptimisticMutation, useShowAlertHandler } from "@avplatform/ui/hooks";

import { vaultOptimisticMutationFn } from "../../apis/vaults-table-apis";
import { VaultsTableDto } from "../../dtos/vaults-table-dto";
import { useTableTab } from "../../hooks/useTableTab";

interface VaultRowDeleteActionProps {
  rowId: string;
}

export const VaultRowDeleteAction = ({ rowId }: VaultRowDeleteActionProps) => {
  const { showCustomAlertDialog } = useShowAlertHandler();
  const { queryKey } = useTableTab();

  const { mutate: deleteConfig } = useListOptimisticMutation<
    string,
    VaultsTableDto | boolean,
    VaultsTableDto
  >([rowId], vaultOptimisticMutationFn, queryKey);

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

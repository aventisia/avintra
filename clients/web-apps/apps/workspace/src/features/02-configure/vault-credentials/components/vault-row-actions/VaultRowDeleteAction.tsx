import { DeleteDDMenuItem } from "@avplatform/ui/dropdown-menu";
import { useListOptimisticMutation, useShowAlertHandler } from "@avplatform/ui/hooks";

import { vaultCredentialOptimisticMutationFn } from "../../apis/vaults-table-apis";
import { VaultCredentialDto } from "../../dtos/vaults-table-dto";
import { useTableTab } from "../../hooks/useTableTab";

interface VaultRowDeleteActionProps {
  rowId: string;
}

export const VaultRowDeleteAction = ({ rowId }: VaultRowDeleteActionProps) => {
  const { showCustomAlertDialog } = useShowAlertHandler();
  const { queryKey } = useTableTab();

  const { mutate: deleteConfig } = useListOptimisticMutation<
    string,
    VaultCredentialDto | boolean | number,
    VaultCredentialDto
  >([rowId], vaultCredentialOptimisticMutationFn, queryKey);

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

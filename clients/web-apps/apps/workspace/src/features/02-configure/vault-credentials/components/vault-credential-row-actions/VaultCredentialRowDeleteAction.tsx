import { DeleteDDMenuItem } from "@avplatform/ui/dropdown-menu";
import { useListOptimisticMutation, useShowAlertHandler } from "@avplatform/ui/hooks";

import { vaultCredentialScopeApis } from "../../apis/vault-credentials.apis";
import { useVaultCredentialScope } from "../../contexts/vault-credential-scope.context";
import { VaultCredentialDto } from "../../dtos/vault-credentials.dto";
import { useTableTab } from "../../hooks/useTableTab";

interface VaultCredentialRowDeleteActionProps {
  rowId: string;
}

export const VaultCredentialRowDeleteAction = ({ rowId }: VaultCredentialRowDeleteActionProps) => {
  const { showCustomAlertDialog } = useShowAlertHandler();
  const { queryKey } = useTableTab();
  const scope = useVaultCredentialScope();

  const { mutate: deleteConfig } = useListOptimisticMutation<
    string,
    VaultCredentialDto | boolean | number,
    VaultCredentialDto
  >([rowId], vaultCredentialScopeApis[scope].optimisticMutationFn, queryKey);

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

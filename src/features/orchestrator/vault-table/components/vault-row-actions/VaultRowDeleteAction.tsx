import { DeleteDDMenuItem } from "@aventisia/ui/dropdown-menu";
import {
  useListOptimisticMutation,
  useShowAlertHandler,
} from "@aventisia/ui/hooks";

import { vaultOptimisticMutationFn } from "../../apis/vaults-table-apis";
import { DATA_QUERY_KEY } from "../../constants";
import { VaultsTableDto } from "../../dtos/vaults-table-dto";

interface VaultRowDeleteActionProps {
  rowId: string;
}

export const VaultRowDeleteAction = ({ rowId }: VaultRowDeleteActionProps) => {
  // Get showAlert handler
  const { showDefaultAlertDialog } = useShowAlertHandler();

  // Get mutation function to delete the config
  const { mutate: deleteConfig } = useListOptimisticMutation<
    string,
    VaultsTableDto | boolean,
    VaultsTableDto
  >([rowId], vaultOptimisticMutationFn, DATA_QUERY_KEY);

  // Return Delete alert dialog trigger
  return (
    <DeleteDDMenuItem
      onClick={() => {
        showDefaultAlertDialog({
          confirmActionFn: () =>
            deleteConfig({
              payload: rowId,
              crudAction: "delete",
            }),
          alertType: "delete-record",
          additionalText: "credential",
        });
      }}
    />
  );
};

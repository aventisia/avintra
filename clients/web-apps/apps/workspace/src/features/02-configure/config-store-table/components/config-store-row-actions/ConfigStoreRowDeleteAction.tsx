import { DeleteDDMenuItem } from "@avplatform/ui/dropdown-menu";
import { useListOptimisticMutation, useShowAlertHandler } from "@avplatform/ui/hooks";

import { configStoreOptimisticMutationFn } from "../../apis/config-stores-table-apis";
import { ConfigStoresTableDto } from "../../dtos/config-stores-table-dto";
import { useTableTab } from "../../hooks/useTableTab";

interface ConfigStoreRowDeleteActionProps {
  rowId: string;
}

export const ConfigStoreRowDeleteAction = ({ rowId }: ConfigStoreRowDeleteActionProps) => {
  // Get showAlert handler
  const { showCustomAlertDialog } = useShowAlertHandler();

  // Use this in place DATA_QUERY_KEY to handle Personal/Shared tabs list
  const { queryKey } = useTableTab();

  // Get mutation function to delete the config store
  const { mutate: deleteConfigStore } = useListOptimisticMutation<
    string,
    ConfigStoresTableDto | boolean,
    ConfigStoresTableDto
  >([rowId], configStoreOptimisticMutationFn, queryKey);

  // Return Delete alert dialog trigger
  return (
    <DeleteDDMenuItem
      onClick={() => {
        showCustomAlertDialog({
          confirmActionFn: () =>
            deleteConfigStore({
              payload: rowId,
              crudAction: "delete",
            }),
          confirmBtnText: "Yes, delete key store",
          title: "Delete key store?",
          description:
            "Are you sure you want to delete key store? This may break any agent that use it.",
        });
      }}
    />
  );
};

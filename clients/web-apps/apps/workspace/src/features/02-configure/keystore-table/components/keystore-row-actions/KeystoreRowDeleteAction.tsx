import { DeleteDDMenuItem } from "@avplatform/ui/dropdown-menu";
import { useListOptimisticMutation, useShowAlertHandler } from "@avplatform/ui/hooks";

import { keystoreOptimisticMutationFn } from "../../apis/keystores-table-apis";
import { KeystoresTableDto } from "../../dtos/keystores-table-dto";
import { useTableTab } from "../../hooks/useTableTab";

interface KeystoreRowDeleteActionProps {
  rowId: string;
}

export const KeystoreRowDeleteAction = ({ rowId }: KeystoreRowDeleteActionProps) => {
  // Get showAlert handler
  const { showCustomAlertDialog } = useShowAlertHandler();

  // Use this in place DATA_QUERY_KEY to handle Personal/Shared tabs list
  const { queryKey } = useTableTab();

  // Get mutation function to delete the keystore
  const { mutate: deleteKeystore } = useListOptimisticMutation<
    string,
    KeystoresTableDto | boolean,
    KeystoresTableDto
  >([rowId], keystoreOptimisticMutationFn, queryKey);

  // Return Delete alert dialog trigger
  return (
    <DeleteDDMenuItem
      onClick={() => {
        showCustomAlertDialog({
          confirmActionFn: () =>
            deleteKeystore({
              payload: rowId,
              crudAction: "delete",
            }),
          confirmBtnText: "Yes, delete keystore",
          title: "Delete keystore?",
          description:
            "Are you sure you want to delete keystore? This may break any agent that use it.",
        });
      }}
    />
  );
};

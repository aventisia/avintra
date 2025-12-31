import { DeleteDDMenuItem } from "@aventisia/ui/dropdown-menu";
import {
  useListOptimisticMutation,
  useShowAlertHandler,
} from "@aventisia/ui/hooks";

import { keystoreOptimisticMutationFn } from "../../apis/keystores-table-apis";
import { DATA_QUERY_KEY } from "../../constants";
import { KeystoresTableDto } from "../../dtos/keystores-table-dto";

interface KeystoreRowDeleteActionProps {
  rowId: string;
}

export const KeystoreRowDeleteAction = ({
  rowId,
}: KeystoreRowDeleteActionProps) => {
  // Get showAlert handler
  const { showCustomAlertDialog } = useShowAlertHandler();

  // Get mutation function to delete the keystore
  const { mutate: deleteKeystore } = useListOptimisticMutation<
    string,
    KeystoresTableDto | boolean,
    KeystoresTableDto
  >([rowId], keystoreOptimisticMutationFn, DATA_QUERY_KEY);

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

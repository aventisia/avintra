import { useListOptimisticMutation } from "@/react-toolkit/hooks/useListOptimisticMutation";
import { useShowAlertHandler } from "@/react-toolkit/hooks/useShowAlertHandler";
import { DeleteDDMenuItem } from "@/react-toolkit/ui/dropdown-menu/DeleteDDMenuItem";
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
  const { showDefaultAlertDialog } = useShowAlertHandler();

  // Get mutation function to delete the config
  const { mutate: deleteConfig } = useListOptimisticMutation<
    string,
    KeystoresTableDto | boolean,
    KeystoresTableDto
  >([rowId], keystoreOptimisticMutationFn, DATA_QUERY_KEY);

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
          additionalText: "config",
        });
      }}
    />
  );
};

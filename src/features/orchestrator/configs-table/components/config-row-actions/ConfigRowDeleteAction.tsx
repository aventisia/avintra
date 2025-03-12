import { useListOptimisticMutation } from "@/react-toolkit/hooks/useListOptimisticMutation";
import { useShowAlertHandler } from "@/react-toolkit/hooks/useShowAlertHandler";
import { DeleteDDMenuItem } from "@/react-toolkit/ui/dropdown-menu/DeleteDDMenuItem";
import { configOptimisticMutationFn } from "../../apis/configs-table-apis";
import { DATA_QUERY_KEY } from "../../constants";
import { ConfigsTableDto } from "../../dtos/configs-table-dto";

interface ConfigRowDeleteActionProps {
  rowId: string;
}

export const ConfigRowDeleteAction = ({
  rowId,
}: ConfigRowDeleteActionProps) => {
  // Get showAlert handler
  const { showDefaultAlertDialog } = useShowAlertHandler();

  // Get mutation function to delete the config
  const { mutate: deleteConfig } = useListOptimisticMutation<
    string,
    ConfigsTableDto | boolean,
    ConfigsTableDto
  >([rowId], configOptimisticMutationFn, DATA_QUERY_KEY);

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

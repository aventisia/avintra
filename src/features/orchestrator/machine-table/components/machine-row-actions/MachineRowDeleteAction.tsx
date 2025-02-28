import { useListOptimisticMutation } from "@/react-toolkit/hooks/useListOptimisticMutation";
import { useShowAlertHandler } from "@/react-toolkit/hooks/useShowAlertHandler";
import { DeleteDDMenuItem } from "@/react-toolkit/ui/dropdown-menu/DeleteDDMenuItem";
import { machineOptimisticMutationFn } from "../../apis/machine-table-apis";
import { DATA_QUERY_KEY } from "../../constants";
import type { MachineDto } from "../../dtos/machine-dto";

interface MachineRowDeleteActionProps {
  rowId: string;
}

export const MachineRowDeleteAction = ({
  rowId,
}: MachineRowDeleteActionProps) => {
  // Get showAlert handler
  const { showDefaultAlertDialog } = useShowAlertHandler();

  // Get mutation function to delete the machine
  const { mutate: deleteMachine } = useListOptimisticMutation<
    string,
    MachineDto | boolean,
    MachineDto
  >([rowId], machineOptimisticMutationFn, DATA_QUERY_KEY);

  // Return Delete alert dialog trigger
  return (
    <DeleteDDMenuItem
      onClick={() => {
        showDefaultAlertDialog({
          confirmActionFn: () =>
            deleteMachine({
              payload: rowId,
              crudAction: "delete",
            }),
          alertType: "delete-record",
          additionalText: "machine",
        });
      }}
    />
  );
};

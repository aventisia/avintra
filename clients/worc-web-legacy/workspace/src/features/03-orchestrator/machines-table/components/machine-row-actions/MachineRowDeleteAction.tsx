import { DeleteDDMenuItem } from "@aventisia/ui/dropdown-menu";
import {
  useListOptimisticMutation,
  useShowAlertHandler,
} from "@aventisia/ui/hooks";

import { machineOptimisticMutationFn } from "../../apis/machines-table-apis";
import { DATA_QUERY_KEY } from "../../constants";
import { MachinesTableDto } from "../../dtos/machines-table-dto";

interface MachineRowDeleteActionProps {
  rowId: string;
}

export const MachineRowDeleteAction = ({
  rowId,
}: MachineRowDeleteActionProps) => {
  // Get showAlert handler
  const { showCustomAlertDialog } = useShowAlertHandler();

  // Get mutation function to delete the machine
  const { mutate: deleteMachine } = useListOptimisticMutation<
    string,
    MachinesTableDto | boolean,
    MachinesTableDto
  >([rowId], machineOptimisticMutationFn, DATA_QUERY_KEY);

  // Return Delete alert dialog trigger
  return (
    <DeleteDDMenuItem
      onClick={() => {
        showCustomAlertDialog({
          confirmActionFn: () =>
            deleteMachine({
              payload: rowId,
              crudAction: "delete",
            }),
          confirmBtnText: "Yes, delete machine",
          title: "Delete Machine?",
          description:
            "Are you sure you want to delete this machine? This action will unassign any agents connected to it, which may affect your workflows.",
        });
      }}
    />
  );
};

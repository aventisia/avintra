import { DeleteDDMenuItem } from "@aventisia/ui/dropdown-menu";
import { useShowAlertHandler } from "@aventisia/ui/hooks";
import { useTableRowOptimisticMutation } from "@aventisia/ui/hooks";

import { deleteMachine } from "../../apis/machines-table-apis";
import { DATA_QUERY_KEY } from "../../constants";
import { MachinesTableRowDto } from "../../dtos/machines-table-row-dto";

interface MachineRowDeleteActionProps {
  rowId: string;
}

export const MachineRowDeleteAction = ({
  rowId,
}: MachineRowDeleteActionProps) => {
  // Get showAlert handler
  const { showCustomAlertDialog } = useShowAlertHandler();

  // Get mutation function to delete the machine
  const { mutate } = useTableRowOptimisticMutation<
    string,
    boolean,
    MachinesTableRowDto
  >("delete", [rowId], deleteMachine, DATA_QUERY_KEY);

  // Return Delete alert dialog trigger
  return (
    <DeleteDDMenuItem
      onClick={() => {
        showCustomAlertDialog({
          confirmActionFn: () => mutate(rowId),
          confirmBtnText: "Yes, delete machine",
          title: "Delete Machine?",
          description:
            "Are you sure you want to delete this machine? This action will unassign any agents connected to it, which may affect your workflows.",
        });
      }}
    />
  );
};

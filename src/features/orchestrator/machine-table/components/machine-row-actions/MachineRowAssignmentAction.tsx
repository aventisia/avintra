import { SimpleDDMenuItem } from "@/react-toolkit/ui/dropdown-menu/SimpleDDMenuItem";
import { useShallow } from "zustand/react/shallow";
import { MachineTaskTypesEnum } from "@/react-toolkit/enums/machine-task-types-enum";
import { useMachineAgentStore } from "../../store/machine-agent-store";

interface MachineRowAssignmentActionProps {
  rowId: string;
}

export const MachineRowAssignmentAction = ({
  rowId,
}: MachineRowAssignmentActionProps) => {
  const { setMachineId, setTypeOfAssignment, setIsDialogOpen } =
    useMachineAgentStore(
      useShallow((state) => ({
        setMachineId: state.setMachineId,
        setTypeOfAssignment: state.setTypeOfAssignment,
        setIsDialogOpen: state.setIsDialogOpen,
      })),
    );

  setMachineId(rowId);

  // Return the component
  return (
    <SimpleDDMenuItem
      onClick={() => {
        setTypeOfAssignment(MachineTaskTypesEnum.Agent);
        setIsDialogOpen(true);
      }}
    >
      <p>Assign Agent</p>
    </SimpleDDMenuItem>
  );
};

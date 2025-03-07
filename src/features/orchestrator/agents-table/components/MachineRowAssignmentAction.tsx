import { SimpleDDMenuItem } from "@/react-toolkit/ui/dropdown-menu/SimpleDDMenuItem";
import { useShallow } from "zustand/react/shallow";
import { useAssignMachineStore } from "../stores/assign-machine-store";

interface MachineRowAssignmentActionProps {
  rowId: string;
}

export const AgentRowMachineAssignmentAction = ({
  rowId,
}: MachineRowAssignmentActionProps) => {
  const { setMachineId, setIsDialogOpen } = useAssignMachineStore(
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
      lucidIconName="PcCase"
      onClick={() => {
        setIsDialogOpen(true);
      }}
    >
      <p>Assign machines</p>
    </SimpleDDMenuItem>
  );
};

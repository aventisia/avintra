import { SimpleDDMenuItem } from "@/react-toolkit/ui/dropdown-menu/SimpleDDMenuItem";
import { ArrowTopRightOnSquareIcon } from "@heroicons/react/24/outline";
import { useOpenMachine } from "../../hooks/useOpenMachine";

interface MachineRowOpenActionProps {
  rowId: string;
}

export const MachineRowOpenAction = ({ rowId }: MachineRowOpenActionProps) => {
  // Get handle function to open machine
  const handleOpenMachineAction = useOpenMachine();

  // Return the component
  return (
    <SimpleDDMenuItem
      content="Open"
      Icon={ArrowTopRightOnSquareIcon}
      onClick={() => handleOpenMachineAction(rowId)}
    />
  );
};

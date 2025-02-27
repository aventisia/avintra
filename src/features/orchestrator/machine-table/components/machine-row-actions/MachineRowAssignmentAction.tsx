import { SimpleDDMenuItem } from "@/react-toolkit/ui/dropdown-menu/SimpleDDMenuItem";
import { useOpenMachine } from "../../hooks/useOpenMachine";
import { cn } from "@/react-toolkit/lib/utils";
import {
  DropdownMenuSub,
  DropdownMenuSubContent,
  DropdownMenuSubTrigger,
} from "@/react-toolkit/ui/dropdown-menu";
import Lucide from "@/react-toolkit/ui/Lucide";

interface MachineRowAssignmentActionProps {
  rowId: string;
}

export const MachineRowAssignmentAction = ({
  rowId,
}: MachineRowAssignmentActionProps) => {
  // Get handle function to open machine
  const handleOpenMachineAction = useOpenMachine();

  // Return the component
  return (
    <DropdownMenuSub>
      <DropdownMenuSubTrigger content="Assign">
        <span className="relative flex cursor-default select-none items-center gap-2">
          <Lucide
            icon="Command"
            className={cn("text-[--icon-color]", "h-4 w-4")}
          />
          Assign
        </span>
      </DropdownMenuSubTrigger>
      <DropdownMenuSubContent
        className={cn("flex w-[7rem] min-w-[7rem] flex-col")}
      >
        <SimpleDDMenuItem
          content="Flow"
          lucidIconName="Workflow"
          onClick={() => handleOpenMachineAction(rowId)}
        />
        <SimpleDDMenuItem
          content="Agent"
          lucidIconName="BrainCircuit"
          onClick={() => handleOpenMachineAction(rowId)}
        />
      </DropdownMenuSubContent>
    </DropdownMenuSub>
  );
};

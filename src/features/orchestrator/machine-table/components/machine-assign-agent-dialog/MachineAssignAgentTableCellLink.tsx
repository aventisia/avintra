import { cn } from "@/react-toolkit/lib/utils";
import { Button } from "@/react-toolkit/ui/buttons/Button";
import { useOpenMachine } from "../../hooks/useOpenMachine";

interface MachineAssignAgentTableCellLinkProps {
  /** The ID of the machine to open. */
  rowId: string;

  /** The cell value to display. */
  cellValue: string;

  /** The cell description to display. */
  description?: string;
}

export const MachineAssignAgentTableCellLink = ({
  rowId,
  cellValue,
  description,
}: MachineAssignAgentTableCellLinkProps) => {
  // Get handle open machine action function
  const handleOpenMachineAction = useOpenMachine();

  // Return the component
  return (
    <div className="grid gap-1.5 leading-none">
      <label className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70">
        <Button
          onClick={() => handleOpenMachineAction(rowId)}
          variant={"link"}
          className={cn(
            "!h-8 truncate font-medium text-foreground hover:cursor-pointer hover:text-primary",
          )}
        >
          {cellValue}
        </Button>
      </label>
      <p className="text-sm text-muted-foreground">{description}</p>
    </div>
  );
};

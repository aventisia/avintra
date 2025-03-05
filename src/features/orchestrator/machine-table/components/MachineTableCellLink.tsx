import { cn } from "@/react-toolkit/lib/utils";
import { Button } from "@/react-toolkit/ui/buttons/Button";

interface MachineTableCellLinkProps {
  /** The ID of the machine to open. */
  rowId?: string;

  /** The cell value to display. */
  cellValue: string;
}

export const MachineTableCellLink = ({
  cellValue,
}: MachineTableCellLinkProps) => {
  // Get handle open machine action function
  // const handleOpenMachineAction = useOpenMachine();

  // Return the component
  return (
    <Button
      // onClick={() => handleOpenMachineAction(rowId)}
      variant={"link"}
      className={cn(
        "!h-8 w-auto truncate font-medium text-foreground hover:text-primary",
      )}
    >
      {cellValue}
    </Button>
  );
};

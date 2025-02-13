import { cn } from "@/react-toolkit/lib/utils";
import { Button } from "@/react-toolkit/ui/buttons/Button";
import { useOpenModelLabelData } from "../hooks/useOpenModel";

interface ModelTableCellLinkProps {
  /** The ID of the model to open. */
  rowId: string;

  /** The cell value to display. */
  cellValue: string;
}

export const ModelTableCellLink = ({
  rowId,
  cellValue,
}: ModelTableCellLinkProps) => {
  // Get handle open label data action function
  const handleOpenModelAction = useOpenModelLabelData();

  // Return the component
  return (
    <Button
      onClick={() => handleOpenModelAction(rowId)}
      variant={"link"}
      className={cn(
        "!h-6 w-auto justify-start truncate font-medium text-foreground hover:text-primary",
      )}
    >
      {cellValue}
    </Button>
  );
};

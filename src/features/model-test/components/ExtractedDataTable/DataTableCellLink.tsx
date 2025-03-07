import { cn } from "@/react-toolkit/lib/utils";
import { Button } from "@/react-toolkit/ui/buttons/Button";

interface ModelTableCellLinkProps {
  /** The ID of the model to open. */
  rowId: string;

  /** The cell value to display. */
  cellValue: string;
}

export const ExtractedDataTableCellLink = ({
  rowId,
  cellValue,
}: ModelTableCellLinkProps) => {
  // Return the component
  return (
    <Button
      onClick={() => console.log(rowId)}
      variant={"link"}
      className={cn(
        "!h-6 w-auto justify-start truncate font-medium text-foreground hover:text-primary",
      )}
    >
      {cellValue}
    </Button>
  );
};

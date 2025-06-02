import { Button } from "@aventisia/ui/buttons";
import { cn } from "@aventisia/ui/lib";

// import { useOpenModel } from "../hooks/useOpenModel";

interface RunReviewTableCellLinkProps {
  /** The ID of the model to open. */
  rowId: string;

  /** The cell value to display. */
  cellValue: string;
}

export const RunReviewTableCellLink = ({
  rowId,
  cellValue,
}: RunReviewTableCellLinkProps) => {
  // Get handle open label data action function
  //   const handleOpenModelAction = useOpenModel();

  // Return the component
  return (
    <Button
      //   onClick={() => handleOpenModelAction(rowId, "View")}
      onClick={() => console.log("open row", rowId)}
      variant={"link"}
      className={cn(
        "!h-6 w-auto justify-start truncate font-medium text-foreground hover:text-primary",
      )}
    >
      {cellValue}
    </Button>
  );
};

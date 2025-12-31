import { Button } from "@aventisia/ui/buttons";
import { cn } from "@aventisia/ui/lib";

import { useOpenRunReviewRecord } from "../../hooks/useOpenRunReviewRecords";

// import { useOpenModel } from "../hooks/useOpenModel";

interface RunReviewTableCellLinkProps {
  /** The ID of the model to open. */
  rowId?: string;

  /** The cell value to display. */
  cellValue: string;

  /** File id of the record/doc */
  fileId: string;
}

export const RunReviewTableCellLink = ({
  fileId,
  cellValue,
}: RunReviewTableCellLinkProps) => {
  const handleOpenRunReviewAction = useOpenRunReviewRecord();

  return (
    <Button
      onClick={() => handleOpenRunReviewAction(fileId)}
      variant={"link"}
      className={cn(
        "!h-6 w-auto justify-start truncate font-medium text-foreground hover:text-primary",
      )}
    >
      {cellValue}
    </Button>
  );
};

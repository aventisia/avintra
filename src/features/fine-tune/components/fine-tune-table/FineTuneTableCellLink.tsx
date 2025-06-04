import { Button } from "@aventisia/ui/buttons";
import { cn } from "@aventisia/ui/lib";

import { useOpenRunReviewRecord } from "../../hooks/useOpenRunReviewRecords";

// import { useOpenModel } from "../hooks/useOpenModel";

interface FineTuneTableCellLinkProps {
  /** The ID of the model to open. */
  rowId?: string;

  /** The cell value to display. */
  cellValue: string;
}

export const FineTuneTableCellLink = ({
  cellValue,
}: FineTuneTableCellLinkProps) => {
  const handleOpenRunReviewAction = useOpenRunReviewRecord();

  return (
    <Button
      onClick={() => handleOpenRunReviewAction()}
      variant={"link"}
      className={cn(
        "!h-6 w-auto justify-start truncate font-medium text-foreground hover:text-primary",
      )}
    >
      {cellValue}
    </Button>
  );
};

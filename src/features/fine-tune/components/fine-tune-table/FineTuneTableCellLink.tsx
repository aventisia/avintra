import { Button } from "@aventisia/ui/buttons";
import { cn } from "@aventisia/ui/lib";

import { useOpenFineTuneRecord } from "../../hooks/useOpenFineTuneRecords";

// import { useOpenModel } from "../hooks/useOpenModel";

interface FineTuneTableCellLinkProps {
  /** The ID of the model to open. */
  rowId?: string;

  /** The cell value to display. */
  cellValue: string;

  /** File id of the record/doc */
  fileId: string;
}

export const FineTuneTableCellLink = ({
  cellValue,
  fileId,
}: FineTuneTableCellLinkProps) => {
  const handleOpenFineTuneAction = useOpenFineTuneRecord();

  return (
    <Button
      onClick={() => handleOpenFineTuneAction(fileId)}
      variant={"link"}
      className={cn(
        "!h-6 w-auto justify-start truncate font-medium text-foreground hover:text-primary",
      )}
    >
      {cellValue}
    </Button>
  );
};

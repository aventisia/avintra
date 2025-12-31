import { Button } from "@aventisia/ui/buttons";
import { cn } from "@aventisia/ui/lib";

import { useOpenArchivedFlow } from "../hooks/useOpenArchivedFlow";

interface ArchivedFlowsTableCellLinkProps {
  /** The version ID of the Archived flow to open. */
  rowId: string;

  /** The ID of the Archived flow to open. */
  refId: string;

  /** The cell value to display. */
  cellValue: string;
}

export const ArchivedFlowsTableCellLink = ({
  rowId,
  refId,
  cellValue,
}: ArchivedFlowsTableCellLinkProps) => {
  // Get handle function to open Archived flow
  const handleOpenArchivedFlowAction = useOpenArchivedFlow();

  // Return the component
  return (
    <Button
      onClick={() => handleOpenArchivedFlowAction(refId, rowId)}
      variant={"link"}
      className={cn(
        "!h-8 w-auto truncate font-medium text-foreground hover:text-primary",
      )}
    >
      {cellValue}
    </Button>
  );
};

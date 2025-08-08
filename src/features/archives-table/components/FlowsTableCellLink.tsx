import { Button } from "@aventisia/ui/buttons";
import { cn } from "@aventisia/ui/lib";

import { useOpenFlow } from "../hooks/useOpenFlow";

interface FlowsTableCellLinkProps {
  /** The version ID of the flow to open. */
  rowId: string;

  /** The ID of the flow to open. */
  refId: string;

  /** The cell value to display. */
  cellValue: string;
}

export const FlowsTableCellLink = ({
  rowId,
  refId,
  cellValue,
}: FlowsTableCellLinkProps) => {
  // Get handle function to open flow
  const handleOpenFlowAction = useOpenFlow();

  // Return the component
  return (
    <Button
      onClick={() => handleOpenFlowAction(refId, rowId)}
      variant={"link"}
      className={cn(
        "!h-8 w-auto truncate font-medium text-foreground hover:text-primary",
      )}
    >
      {cellValue}
    </Button>
  );
};

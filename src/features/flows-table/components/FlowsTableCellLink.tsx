import { cn } from "@/react-toolkit/lib/utils";
import { Button } from "@/react-toolkit/ui/buttons/Button";

import { useOpenFlow } from "../hooks/useOpenFlow";

interface FlowsTableCellLinkProps {
  /** The ID of the flow to open. */
  rowId: string;

  /** The cell value to display. */
  cellValue: string;
}

export const FlowsTableCellLink = ({
  rowId,
  cellValue,
}: FlowsTableCellLinkProps) => {
  // Get handle function to open flow
  const handleOpenFlowAction = useOpenFlow();

  // Return the component
  return (
    <Button
      onClick={() => handleOpenFlowAction(rowId)}
      variant={"link"}
      className={cn(
        "!h-8 w-auto truncate font-medium text-foreground hover:text-primary",
      )}
    >
      {cellValue}
    </Button>
  );
};

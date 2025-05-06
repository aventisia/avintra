import { Button } from "@aventisia/ui/buttons";
import { cn } from "@aventisia/ui/lib";

import { useOpenPayloadTable } from "../../hooks/useOpenPayloadTable";

interface PayloadTableCellLinkProps {
  /** The ID of the work items to open. */
  rowId: string;

  /** The cell value to display. */
  children: React.ReactNode;
}

export const PayloadTableCellLink = ({
  rowId,
  children,
}: PayloadTableCellLinkProps) => {
  // Get handle function to open work items
  const handleOpenWorkItemsAction = useOpenPayloadTable();

  // Return the component
  return (
    <Button
      onClick={() => handleOpenWorkItemsAction(rowId)}
      variant={"link"}
      className={cn(
        "!h-8 w-auto truncate font-medium text-foreground hover:text-primary",
      )}
    >
      {children}
    </Button>
  );
};

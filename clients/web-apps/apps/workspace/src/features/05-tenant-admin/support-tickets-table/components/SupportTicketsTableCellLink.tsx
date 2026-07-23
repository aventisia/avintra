import { Button } from "@avplatform/ui/buttons";
import { cn } from "@avplatform/ui/lib";

import { useOpenSupportTicket } from "../hooks/useOpenSupportTicket";

interface SupportTicketsTableCellLinkProps {
  /** The ID of the support ticket to open. */
  rowId: string;

  /** The cell value to display. */
  cellValue: string;
}

export const SupportTicketsTableCellLink = ({
  rowId,
  cellValue,
}: SupportTicketsTableCellLinkProps) => {
  // Get handle open support ticket action function
  const handleOpenSupportTicketAction = useOpenSupportTicket(rowId);

  // Return the component
  return (
    <Button
      onClick={() => handleOpenSupportTicketAction()}
      variant={"link"}
      className={cn("!h-8 w-auto truncate text-lg font-normal text-foreground hover:text-primary")}
      key={rowId}
    >
      {cellValue}
    </Button>
  );
};

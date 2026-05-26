import { SimpleDDMenuItem } from "@aventisia/ui/dropdown-menu";
import { ArrowTopRightOnSquareIcon } from "@heroicons/react/24/outline";

import { useOpenSupportTicket } from "../../hooks/useOpenSupportTicket";

interface SupportTicketRowOpenActionProps {
  rowId: string;
}

export const SupportTicketRowOpenAction = ({
  rowId,
}: SupportTicketRowOpenActionProps) => {
  // Get handle function to open support ticket
  const handleOpenSupportTicketAction = useOpenSupportTicket(rowId);

  // Return the component
  return (
    <SimpleDDMenuItem
      content="Open"
      Icon={ArrowTopRightOnSquareIcon}
      onClick={() => handleOpenSupportTicketAction()}
    />
  );
};

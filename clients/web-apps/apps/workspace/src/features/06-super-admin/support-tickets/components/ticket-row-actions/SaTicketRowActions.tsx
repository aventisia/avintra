import { useNavigate } from "react-router-dom";
import { DTRowAction, DataTableRowActions } from "@avplatform/ui/data-table";
import { DropdownMenuItem } from "@avplatform/ui/dropdown-menu";
import { DropdownMenuSeparator } from "@avplatform/ui/dropdown-menu";
import { ExternalLinkIcon } from "lucide-react";
import { SaTicketRowDeleteAction } from "./SaTicketRowDeleteAction";

interface SaTicketRowActionsProps {
  rowId: string;
}

export const SaTicketRowActions = ({ rowId }: SaTicketRowActionsProps) => {
  const navigate = useNavigate();

  return (
    <DataTableRowActions className="w-48 min-w-48">
      <DropdownMenuItem onClick={() => navigate(`/sa/support/tickets/${rowId}`)}>
        <ExternalLinkIcon className="mr-2 h-4 w-4" />
        Open
      </DropdownMenuItem>
      <DropdownMenuSeparator />
      <DTRowAction rowId={rowId} crudAction="update" entity="saSupportTicket" />
      <DropdownMenuSeparator />
      <SaTicketRowDeleteAction rowId={rowId} />
    </DataTableRowActions>
  );
};

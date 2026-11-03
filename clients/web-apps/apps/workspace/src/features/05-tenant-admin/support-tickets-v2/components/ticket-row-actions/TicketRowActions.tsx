import { CrudRowAction } from "@avplatform/ui/crud-dialog";
import { DropdownMenuItem } from "@avplatform/ui/dropdown-menu";
import { DropdownMenuSeparator } from "@avplatform/ui/dropdown-menu";
import { TableCNRowActionsMenu } from "@avplatform/ui/table-cn";
import { ExternalLinkIcon } from "lucide-react";
import { useNavigate } from "react-router-dom";

import { TicketRowDeleteAction } from "./TicketRowDeleteAction";

interface TicketRowActionsProps {
  rowId: string;
}

export const TicketRowActions = ({ rowId }: TicketRowActionsProps) => {
  const navigate = useNavigate();

  return (
    <TableCNRowActionsMenu ariaLabel="Open ticket actions" contentClassName="w-48 min-w-48">
      <DropdownMenuItem onClick={() => navigate(`/tenant/support/tickets/${rowId}`)}>
        <ExternalLinkIcon className="mr-2 h-4 w-4" />
        Open
      </DropdownMenuItem>
      <DropdownMenuSeparator />
      <CrudRowAction rowId={rowId} crudAction="update" entity="ticket" />
      <DropdownMenuSeparator />
      <TicketRowDeleteAction rowId={rowId} />
    </TableCNRowActionsMenu>
  );
};

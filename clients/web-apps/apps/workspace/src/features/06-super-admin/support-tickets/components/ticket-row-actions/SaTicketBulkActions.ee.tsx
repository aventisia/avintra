import { LockedActionTooltip, useActionLock } from "@avplatform/ui/action-lock";
import { useListOptimisticMutation, useShowAlertHandler } from "@avplatform/ui/hooks";
import {
  TableCNActionBar,
  TableCNActionBarItem,
  TableCNActionBarSelection,
  TableCNActionBarSeparator,
} from "@avplatform/ui/table-cn";
import { Table } from "@tanstack/react-table";
import { Trash2 } from "lucide-react";

import { TicketTableDto } from "@/features/05-tenant-admin/support-tickets-v2/dtos/TicketDto";

import { saTicketOptimisticMutationFn } from "../../apis/sa-ticket-apis.ee";
import { DATA_QUERY_KEY } from "../../constants";

interface SaTicketBulkActionsProps {
  table: Table<TicketTableDto>;
}

export function SaTicketBulkActions({ table }: Readonly<SaTicketBulkActionsProps>) {
  const { showDefaultAlertDialog } = useShowAlertHandler();
  const { locked } = useActionLock();

  const selectedRowIds = table
    .getFilteredSelectedRowModel()
    .rows.map((row) => row.original.id)
    .filter((id): id is string => id !== undefined);

  const clearSelection = () => table.toggleAllRowsSelected(false);

  const { mutate: deleteTickets } = useListOptimisticMutation<
    string[],
    TicketTableDto | boolean | number,
    TicketTableDto
  >(selectedRowIds, saTicketOptimisticMutationFn, DATA_QUERY_KEY);

  return (
    <TableCNActionBar table={table}>
      <TableCNActionBarSelection table={table} />
      <TableCNActionBarSeparator />
      <LockedActionTooltip>
        <TableCNActionBarItem
          icon={Trash2}
          tone="destructive"
          disabled={locked}
          onClick={() => {
            showDefaultAlertDialog({
              confirmActionFn: () => {
                deleteTickets({
                  payload: selectedRowIds,
                  crudAction: "delete-multiple",
                });
                clearSelection();
              },
              alertType: "delete-multiple",
              additionalText: `${selectedRowIds.length} ${selectedRowIds.length > 1 ? "tickets" : "ticket"}`,
            });
          }}
        >
          Delete
        </TableCNActionBarItem>
      </LockedActionTooltip>
    </TableCNActionBar>
  );
}

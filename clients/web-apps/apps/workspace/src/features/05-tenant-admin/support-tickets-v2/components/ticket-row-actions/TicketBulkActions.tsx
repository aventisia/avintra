import { LockedActionTooltip, useActionLock } from "@avplatform/ui/action-lock";
import { useListOptimisticMutation, useShowAlertHandler } from "@avplatform/ui/hooks";
import {
  TableCNActionBar,
  TableCNActionBarItem,
  TableCNActionBarSelection,
  TableCNActionBarSeparator,
} from "@avplatform/ui/table-cn";
import { TrashIcon } from "@phosphor-icons/react";
import { Table } from "@tanstack/react-table";

import { ticketOptimisticMutationFn } from "../../apis/ticket-apis";
import { DATA_QUERY_KEY } from "../../constants";
import { TicketTableDto } from "../../dtos/TicketDto";

interface TicketBulkActionsProps {
  table: Table<TicketTableDto>;
}

export function TicketBulkActions({ table }: Readonly<TicketBulkActionsProps>) {
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
  >(selectedRowIds, ticketOptimisticMutationFn, DATA_QUERY_KEY);

  return (
    <TableCNActionBar table={table}>
      <TableCNActionBarSelection table={table} />
      <TableCNActionBarSeparator />
      <LockedActionTooltip>
        <TableCNActionBarItem
          icon={TrashIcon}
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

import { Separator } from "@avplatform/ui";
import { DTBulkActions, DTBulkDeleteAction, DTSelectionInfo } from "@avplatform/ui/data-table";
import { useListOptimisticMutation, useShowAlertHandler } from "@avplatform/ui/hooks";
import { Table } from "@tanstack/react-table";

import { TicketTableDto } from "@/features/05-tenant-admin/support-tickets-v2/dtos/TicketDto";

import { saTicketOptimisticMutationFn } from "../../apis/sa-ticket-apis";
import { DATA_QUERY_KEY } from "../../constants";

interface SaTicketBulkActionsProps {
  table: Table<TicketTableDto>;
}

export function SaTicketBulkActions({ table }: Readonly<SaTicketBulkActionsProps>) {
  const { showDefaultAlertDialog } = useShowAlertHandler();

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
    <>
      {selectedRowIds.length > 0 && (
        <DTBulkActions>
          <DTSelectionInfo table={table} />
          <Separator orientation="vertical" className="h-6 w-[0.5px]" />
          <DTBulkDeleteAction
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
          />
        </DTBulkActions>
      )}
    </>
  );
}

import { Separator } from "@avplatform/ui";
import { DTBulkActions, DTBulkDeleteAction, DTSelectionInfo } from "@avplatform/ui/data-table";
import { useListOptimisticMutation, useShowAlertHandler } from "@avplatform/ui/hooks";
import { Table } from "@tanstack/react-table";
import { useShallow } from "zustand/react/shallow";

import { useCurrentSpaceStore } from "@/stores/current-space-store";

import { queueOptimisticMutationFn } from "../../apis/queues-table-apis";
import { QueuesTableDto } from "../../dtos/queues-table-dto";
import { useTableTab } from "../../hooks/useTableTab";

interface QueueBulkActionsProps {
  table: Table<QueuesTableDto>;
}

export function QueueBulkActions({ table }: Readonly<QueueBulkActionsProps>) {
  // Get showAlert handler
  const { showDefaultAlertDialog } = useShowAlertHandler();

  // Use this in place DATA_QUERY_KEY to handle Personal/Shared tabs list
  const { queryKey } = useTableTab();

  // Get the currently selected space so the mutation targets the same
  // query cache key that useFetchQueues writes to (which includes the space id).
  const { currentSpace } = useCurrentSpaceStore(
    useShallow((state) => ({
      currentSpace: state.currentSpace,
    })),
  );

  // Get rowIds of selected rows
  const selectedRowIds =
    table
      .getFilteredSelectedRowModel()
      .rows.map((row) => row.original.id)
      .filter((id): id is string => id !== undefined) || true;

  // Get mutation function to delete the queue
  const { mutate: deletequeues } = useListOptimisticMutation<
    string[],
    QueuesTableDto | boolean,
    QueuesTableDto
  >(selectedRowIds, queueOptimisticMutationFn, [...queryKey, currentSpace?.id]);

  return (
    <>
      {selectedRowIds.length > 0 && (
        <DTBulkActions>
          <DTSelectionInfo table={table} />
          <Separator orientation="vertical" className="h-6 w-[0.5px]" />
          <DTBulkDeleteAction
            onClick={() => {
              // Show alert dialog to confirm delete
              showDefaultAlertDialog({
                confirmActionFn: () => {
                  // Delete selected queues
                  deletequeues({
                    payload: selectedRowIds,
                    crudAction: "delete-multiple",
                  });

                  // Remove selection
                  table.toggleAllRowsSelected(false);
                },
                alertType: "delete-multiple",
                additionalText: `${selectedRowIds.length} ${selectedRowIds.length > 1 ? "queues" : "queue"}`,
              });
            }}
          />
        </DTBulkActions>
      )}
    </>
  );
}

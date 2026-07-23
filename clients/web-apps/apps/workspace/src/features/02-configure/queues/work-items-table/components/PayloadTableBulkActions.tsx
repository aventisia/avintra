import { Separator } from "@avplatform/ui";
import { DTBulkActions, DTBulkDeleteAction, DTSelectionInfo } from "@avplatform/ui/data-table";
import { useOptimisticMutation, useShowAlertHandler } from "@avplatform/ui/hooks";
import { Table } from "@tanstack/react-table";
import Enumerable from "linq";
import { useShallow } from "zustand/react/shallow";

import { updateQueuesWorkItems } from "../apis/work-items-table-apis";
import { QueueWorkItemDto } from "../dtos/queue-work-item-dto";
import { usePayloadDataStore } from "../store/payload-data-store";

interface PayloadTableBulkActionsProps<TData> {
  table: Table<TData>;
}

export function PayloadTableBulkActions<TData>({
  table,
}: Readonly<PayloadTableBulkActionsProps<TData>>) {
  // Get showAlert handler
  const { showDefaultAlertDialog } = useShowAlertHandler();

  const { payloadData, currentWorkItem, setPayloadData } = usePayloadDataStore(
    useShallow((state) => ({
      currentWorkItem: state.currentWorkItem,
      payloadData: state.payloadData,
      setPayloadData: state.setPayloadData,
    })),
  );

  // Get mutation function to delete the queue
  const { mutate: mutatePayloadData } = useOptimisticMutation<
    QueueWorkItemDto,
    QueueWorkItemDto | boolean,
    QueueWorkItemDto
  >(updateQueuesWorkItems, [currentWorkItem?.id ?? "id"], undefined);

  // Get rowIds of selected rows
  const selectedRows = Enumerable.from(
    table.getFilteredSelectedRowModel().rows.map((row) => row.original),
  ).toArray();

  const handleRemoveSelected = () => {
    const toRemove = Enumerable.from<TData>(payloadData as TData[])
      .where((x) => !selectedRows.find((y) => JSON.stringify(x) == JSON.stringify(y)))
      .toArray();

    setPayloadData(toRemove as Array<object>);

    if (!currentWorkItem || table.getSelectedRowModel().rows.length <= 0) {
      return;
    }
    table.toggleAllRowsSelected(false);
    mutatePayloadData({
      id: currentWorkItem.id,
      queueId: currentWorkItem.queueId,
      payloadData: JSON.stringify(usePayloadDataStore.getState().payloadData),
    });
  };

  return (
    <>
      {selectedRows.length > 0 && (
        <DTBulkActions>
          <DTSelectionInfo table={table} />
          <Separator orientation="vertical" className="h-6 w-[0.5px]" />
          <DTBulkDeleteAction
            type="button"
            onClick={() => {
              // Show alert dialog to confirm delete
              showDefaultAlertDialog({
                confirmActionFn: () => {
                  // Remove selection
                  handleRemoveSelected();
                },
                alertType: "delete-multiple",
                additionalText: `${selectedRows.length} ${selectedRows.length > 1 ? "items" : "item"}`,
              });
            }}
          />
        </DTBulkActions>
      )}
    </>
  );
}

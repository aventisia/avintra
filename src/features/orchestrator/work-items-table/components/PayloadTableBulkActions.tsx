import { Separator } from "@aventisia/ui";
import {
  DTBulkActions,
  DTBulkDeleteAction,
  DTSelectionInfo,
} from "@aventisia/ui/data-table";
import {
  useOptimisticMutation,
  useShowAlertHandler,
} from "@aventisia/ui/hooks";
import { Table } from "@tanstack/react-table";
import Enumerable from "linq";
import { useEffect, useState } from "react";
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

  const [tableData, setTableData] = useState<Array<object>>([]);

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

  useEffect(() => {
    usePayloadDataStore.subscribe(
      (state) => state.payloadData,
      (payload) => {
        if (payload) setTableData(payload);
      },
    );
  }, []);

  // Get rowIds of selected rows
  const selectedRows = Enumerable.from(
    table.getFilteredSelectedRowModel().rows.map((row) => row.original),
  ).toArray();

  const handleRemoveSelected = () => {
    const toRemove = Enumerable.from<TData>(payloadData as TData[])
      .where(
        (x) =>
          !selectedRows.find((y) => JSON.stringify(x) == JSON.stringify(y)),
      )
      .toArray();

    setPayloadData(toRemove as Array<object>);

    if (!currentWorkItem || table.getSelectedRowModel().rows.length <= 0) {
      return;
    }
    mutatePayloadData({
      id: currentWorkItem.id,
      queueId: currentWorkItem.queueId,
      payloadData: JSON.stringify(tableData),
    });
    table.toggleAllRowsSelected(false);

    console.log(payloadData);
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

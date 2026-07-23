import { Separator } from "@avplatform/ui";
import { DTBulkDeleteAction, DTSelectionInfo } from "@avplatform/ui/data-table";
import { useShowAlertHandler } from "@avplatform/ui/hooks";
import { Table } from "@tanstack/react-table";
import Enumerable from "linq";
import { useShallow } from "zustand/react/shallow";

import { useQueueUploadItemsStore } from "../../../stores/queues-upload-item-store";

interface QueueBulkActionsProps<TData> {
  table: Table<TData>;
}

export function UploadedItemsTableBulkActions<TData>({
  table,
}: Readonly<QueueBulkActionsProps<TData>>) {
  // Get showAlert handler
  const { showDefaultAlertDialog } = useShowAlertHandler();

  const { uploadedItems, setUploadedItems } = useQueueUploadItemsStore(
    useShallow((state) => ({
      uploadedItems: state.uploadedItems,
      setUploadedItems: state.setUploadedItems,
    })),
  );

  // Get rowIds of selected rows
  const selectedRows = Enumerable.from(
    table.getFilteredSelectedRowModel().rows.map((row) => row.original),
  ).toArray();

  const handleRemoveSelected = () => {
    const toRemove = Enumerable.from<TData>(uploadedItems as TData[])
      .where((x) => !selectedRows.find((y) => JSON.stringify(x) == JSON.stringify(y)))
      .toArray();

    setUploadedItems(toRemove as Array<object>);
    table.toggleAllRowsSelected(false);
  };

  return (
    <>
      {selectedRows.length > 0 && (
        <div className="group flex items-center gap-2">
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
        </div>
      )}
    </>
  );
}

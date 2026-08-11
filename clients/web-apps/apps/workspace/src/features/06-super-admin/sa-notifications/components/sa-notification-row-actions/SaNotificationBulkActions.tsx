import { Separator } from "@avplatform/ui";
import { DTBulkActions, DTBulkDeleteAction, DTSelectionInfo } from "@avplatform/ui/data-table";
import { useTableRowOptimisticMutation } from "@avplatform/ui/hooks";
import { useShowAlertHandler } from "@avplatform/ui/hooks";
import { Table } from "@tanstack/react-table";

import { deleteMultipleSaNotifications } from "../../apis/sa-notification-apis";
import { SaNotificationDto } from "../../dtos/sa-notification.dto";
import { SA_NOTIFICATIONS_QUERY_KEY } from "../../hooks/useFetchSaNotifications.hook";

interface SaNotificationBulkActionsProps {
  table: Table<SaNotificationDto>;
}

export function SaNotificationBulkActions({ table }: SaNotificationBulkActionsProps) {
  // Get showAlert handler
  const { showCustomAlertDialog } = useShowAlertHandler();

  // Get rowIds of selected rows
  const selectedRowIds = table
    .getFilteredSelectedRowModel()
    .rows.map((row) => row.original.id)
    .filter((id): id is string => id !== undefined);

  // Construct entity name for alert dialog
  const entityName =
    selectedRowIds.length > 1 ? `${selectedRowIds.length} notifications` : `notification`;

  // Get mutation function to delete the notifications
  const { mutate } = useTableRowOptimisticMutation<string[], number, SaNotificationDto>(
    "delete-multiple",
    selectedRowIds,
    deleteMultipleSaNotifications,
    SA_NOTIFICATIONS_QUERY_KEY,
  );

  return (
    <>
      {selectedRowIds.length > 0 && (
        <DTBulkActions>
          <DTSelectionInfo table={table} />
          <Separator orientation="vertical" className="h-6 w-[0.5px]" />
          <DTBulkDeleteAction
            onClick={() => {
              showCustomAlertDialog({
                confirmActionFn: () => {
                  // Delete selected notifications
                  mutate(selectedRowIds);

                  // Remove selection
                  table.toggleAllRowsSelected(false);
                },
                confirmBtnText: `Yes, delete ${entityName}`,
                title: `Delete ${entityName}?`,
                description: `Are you sure you want to delete the selected ${entityName}?`,
              });
            }}
          />
        </DTBulkActions>
      )}
    </>
  );
}

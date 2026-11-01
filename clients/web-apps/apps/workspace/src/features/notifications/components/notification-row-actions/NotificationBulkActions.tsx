import { LockedActionTooltip, useActionLock } from "@avplatform/ui/action-lock";
import { NotificationStatusEnum } from "@avplatform/ui/enums";
import { useShowAlertHandler, useTableRowOptimisticMutation } from "@avplatform/ui/hooks";
import {
  TableCNActionBar,
  TableCNActionBarItem,
  TableCNActionBarSelection,
  TableCNActionBarSeparator,
} from "@avplatform/ui/table-cn";
import { Table } from "@tanstack/react-table";
import { Trash2 } from "lucide-react";

import { deleteMultipleNotifications } from "../../apis/notification-apis";
import { NotificationDto } from "../../dtos/notification.dto";
import { NOTIFICATIONS_QUERY_KEY } from "../../hooks/useFetchNotifications.hook";

interface NotificationBulkActionsProps {
  table: Table<NotificationDto>;
}

export function NotificationBulkActions({ table }: NotificationBulkActionsProps) {
  // Get showAlert handler
  const { showCustomAlertDialog } = useShowAlertHandler();
  const { locked } = useActionLock();

  // Get rowIds of selected rows, excluding sent notifications (they are immutable and cannot be deleted)
  const selectedRowIds = table
    .getFilteredSelectedRowModel()
    .rows.filter((row) => row.original.status !== NotificationStatusEnum.Sent)
    .map((row) => row.original.id)
    .filter((id): id is string => id !== undefined);

  // Construct entity name for alert dialog
  const entityName =
    selectedRowIds.length > 1 ? `${selectedRowIds.length} notifications` : `notification`;

  // Get mutation function to delete the notifications
  const { mutate } = useTableRowOptimisticMutation<string[], number, NotificationDto>(
    "delete-multiple",
    selectedRowIds,
    deleteMultipleNotifications,
    NOTIFICATIONS_QUERY_KEY,
  );

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
        >
          Delete
        </TableCNActionBarItem>
      </LockedActionTooltip>
    </TableCNActionBar>
  );
}

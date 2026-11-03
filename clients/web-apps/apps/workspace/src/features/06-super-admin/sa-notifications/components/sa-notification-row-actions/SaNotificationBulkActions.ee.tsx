import { LockedActionTooltip, useActionLock } from "@avplatform/ui/action-lock";
import { NotificationStatusEnum } from "@avplatform/ui/enums";
import { useShowAlertHandler, useTableRowOptimisticMutation } from "@avplatform/ui/hooks";
import {
  TableCNActionBar,
  TableCNActionBarItem,
  TableCNActionBarSelection,
  TableCNActionBarSeparator,
} from "@avplatform/ui/table-cn";
import { TrashIcon } from "@phosphor-icons/react";
import { Table } from "@tanstack/react-table";

import { deleteMultipleSaNotifications } from "../../apis/sa-notification-apis.ee";
import { SaNotificationDto } from "../../dtos/sa-notification.dto.ee";
import { SA_NOTIFICATIONS_QUERY_KEY } from "../../hooks/useFetchSaNotifications.hook.ee";

interface SaNotificationBulkActionsProps {
  table: Table<SaNotificationDto>;
}

export function SaNotificationBulkActions({ table }: SaNotificationBulkActionsProps) {
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
  const { mutate } = useTableRowOptimisticMutation<string[], number, SaNotificationDto>(
    "delete-multiple",
    selectedRowIds,
    deleteMultipleSaNotifications,
    SA_NOTIFICATIONS_QUERY_KEY,
  );

  return (
    <TableCNActionBar table={table}>
      <TableCNActionBarSelection table={table} />
      <TableCNActionBarSeparator />
      <LockedActionTooltip>
        <TableCNActionBarItem
          icon={TrashIcon}
          tone="destructive"
          disabled={locked || selectedRowIds.length === 0}
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

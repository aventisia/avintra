import { Button } from "@avplatform/ui/buttons";
import {
  DTHeading,
  DTPagination,
  DTSearchBox,
  DTViewOptions,
  DataTable,
  DataTableSkeleton,
  getDataTablePreferences,
} from "@avplatform/ui/data-table";
import { Dialog, DialogContent, DialogDefaultHeader } from "@avplatform/ui/dialog";
import { useDataTable, useDocumentTitle } from "@avplatform/ui/hooks";
import { PlusIcon } from "@heroicons/react/24/outline";
import { useMemo, useState } from "react";

import { columnDisplayNames } from "../constants/column-display-names";
import { columnVisibilityState } from "../constants/column-visibility-state";
import { TABLE_HEADING, TABLE_KEY } from "../constants/notifications-table.constant";
import { useFetchNotifications } from "../hooks/useFetchNotifications.hook";
import { NotificationComposeForm } from "./NotificationComposeForm";
import { getNotificationsTableColumns } from "./NotificationsTableColumns";
import { NotificationBulkActions } from "./notification-row-actions/NotificationBulkActions";

/**
 * Renders the notifications table with search, column view filter, row selection
 * (bulk delete), and view/edit/delete actions.
 */
export const NotificationsTable = () => {
  // Set the document title
  useDocumentTitle(TABLE_HEADING);

  // Get data-table preferences (column visibility / sorting) from local storage
  const { columnVisibility, sortState } = getDataTablePreferences(TABLE_KEY, columnVisibilityState);

  const { data, isLoading } = useFetchNotifications();

  const [isCreateOpen, setIsCreateOpen] = useState(false);

  const notifications = useMemo(() => data?.data ?? [], [data]);

  const columns = getNotificationsTableColumns();

  const table = useDataTable(columns, notifications, columnVisibility, sortState, true);

  return (
    <>
      {isLoading ? (
        <DataTableSkeleton />
      ) : (
        <div className="space-y-4 pb-4 pt-[17px]">
          {/* Table toolbar */}
          <div className="flex items-center justify-between">
            <DTHeading heading={TABLE_HEADING} />

            <div className="flex items-center gap-2">
              <DTSearchBox
                table={table}
                searchColumns={["title", "message"]}
                placeholder="Search notifications..."
              />
              <DTViewOptions {...{ table, columnDisplayNames, tableKey: TABLE_KEY }} />
              <Button
                size="xs"
                className="gap-2 text-sm tracking-wide"
                onClick={() => setIsCreateOpen(true)}
              >
                <PlusIcon className="h-4 w-4" />
                Create
              </Button>
            </div>
          </div>

          {/* Data table */}
          <DataTable table={table} columnsLength={columns.length} />

          {/* Bulk delete actions */}
          <NotificationBulkActions table={table} />

          <DTPagination
            table={table}
            isRowSelectionEnabled
            singularLabel="notification"
            pluralLabel="notifications"
          />
        </div>
      )}

      {/* Create notification dialog (right side) */}
      <Dialog open={isCreateOpen} onOpenChange={setIsCreateOpen}>
        <DialogContent side={"right"} className="!max-w-[36rem]">
          <DialogDefaultHeader
            className="px-3.5 py-4 text-lg tracking-wide"
            heading="Create notification"
          />
          <NotificationComposeForm onSuccess={() => setIsCreateOpen(false)} />
        </DialogContent>
      </Dialog>
    </>
  );
};

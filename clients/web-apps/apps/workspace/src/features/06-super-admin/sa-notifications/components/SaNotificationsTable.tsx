import {
  DTCreateButton,
  DTHeading,
  DTPagination,
  DTSearchBox,
  DTViewOptions,
  DataTable,
  DataTableSkeleton,
  getDataTablePreferences,
} from "@avplatform/ui/data-table";
import { useDataTable, useDocumentTitle } from "@avplatform/ui/hooks";
import { useMemo } from "react";

import { useFetchSaNotifications } from "../hooks/useFetchSaNotifications.hook";
import { getSaNotificationsTableColumns } from "./SaNotificationsTableColumns";
import { SaNotificationBulkActions } from "./sa-notification-row-actions/SaNotificationBulkActions";
import { SA_TABLE_HEADING, SA_TABLE_KEY } from "../constants/sa-notifications-table.constant";
import { columnDisplayNames } from "../constants/column-display-names";
import { columnVisibilityState } from "../constants/column-visibility-state";

/**
 * Renders the Super Admin notifications table with search, column view filter,
 * row selection (bulk delete), and view/edit/delete actions.
 */
export const SaNotificationsTable = () => {
  // Set the document title
  useDocumentTitle(SA_TABLE_HEADING);

  // Get data-table preferences (column visibility / sorting) from local storage
  const { columnVisibility, sortState } = getDataTablePreferences(SA_TABLE_KEY, columnVisibilityState);

  const { data, isLoading } = useFetchSaNotifications();

  const notifications = useMemo(() => data?.data ?? [], [data]);

  const columns = getSaNotificationsTableColumns();

  const table = useDataTable(columns, notifications, columnVisibility, sortState, true);

  return (
    <>
      {isLoading ? (
        <DataTableSkeleton />
      ) : (
        <div className="space-y-4 pb-4 pt-[17px]">
          {/* Table toolbar */}
          <div className="flex items-center justify-between">
            <DTHeading heading={SA_TABLE_HEADING} />

            <div className="flex items-center gap-2">
              <DTSearchBox
                table={table}
                searchColumns={["title", "message"]}
                placeholder="Search notifications..."
              />
              <DTViewOptions {...{ table, columnDisplayNames, tableKey: SA_TABLE_KEY }} />
              <DTCreateButton entity="saNotification" />
            </div>
          </div>

          {/* Data table */}
          <DataTable table={table} columnsLength={columns.length} />

          {/* Bulk delete actions */}
          <SaNotificationBulkActions table={table} />

          <DTPagination table={table} isRowSelectionEnabled singularLabel="notification" pluralLabel="notifications" />
        </div>
      )}
    </>
  );
};

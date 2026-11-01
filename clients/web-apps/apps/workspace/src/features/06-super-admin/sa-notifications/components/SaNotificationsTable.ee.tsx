import { DTCreateButton, DTHeading } from "@avplatform/ui/data-table";
import { useDocumentTitle } from "@avplatform/ui/hooks";
import { TableCN, TableCNSkeleton, TableCNToolbar, useTableCN } from "@avplatform/ui/table-cn";
import { useMemo } from "react";

import {
  SA_NOTIFICATIONS_INITIAL_STATE,
  SA_NOTIFICATIONS_PAGE_SIZE_OPTIONS,
  SA_NOTIFICATIONS_ROW_LABELS,
  SA_TABLE_HEADING,
  SA_TABLE_KEY,
} from "../constants/sa-notifications-table.constant.ee";
import { useFetchSaNotifications } from "../hooks/useFetchSaNotifications.hook.ee";
import { getSaNotificationsTableColumns } from "./SaNotificationsTableColumns.ee";
import { SaNotificationBulkActions } from "./sa-notification-row-actions/SaNotificationBulkActions.ee";

const PAGINATION_PROPS = {
  pageSizeOptions: SA_NOTIFICATIONS_PAGE_SIZE_OPTIONS,
  rowLabels: SA_NOTIFICATIONS_ROW_LABELS,
};

/**
 * Renders the Super Admin notifications table with search, column view filter,
 * row selection (bulk delete), and view/edit/delete actions.
 */
export const SaNotificationsTable = () => {
  // Set the document title
  useDocumentTitle(SA_TABLE_HEADING);

  const { data, isLoading } = useFetchSaNotifications();

  const notifications = useMemo(() => data?.data ?? [], [data]);

  const columns = getSaNotificationsTableColumns();

  // Create a TableCN table; page, size, and sorting live in the URL
  const { table } = useTableCN({
    data: notifications,
    columns,
    initialState: SA_NOTIFICATIONS_INITIAL_STATE,
    persistKey: SA_TABLE_KEY,
    searchColumns: ["title", "message"],
  });

  return (
    <>
      {isLoading ? (
        <TableCNSkeleton columnCount={9} />
      ) : (
        <div className="space-y-4 pb-4 pt-[17px]">
          {/* Table toolbar */}
          <div className="flex items-center justify-between">
            <DTHeading heading={SA_TABLE_HEADING} />

            <div className="flex items-center gap-2">
              <DTCreateButton entity="saNotification" />
            </div>
          </div>

          {/* Data table with its search, view options, footer and bulk actions */}
          <TableCN
            table={table}
            label={SA_TABLE_HEADING}
            paginationProps={PAGINATION_PROPS}
            actionBar={<SaNotificationBulkActions table={table} />}
          >
            <TableCNToolbar table={table} searchPlaceholder="Search notifications..." />
          </TableCN>
        </div>
      )}
    </>
  );
};

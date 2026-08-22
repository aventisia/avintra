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
import { cn } from "@avplatform/ui/lib";
import { PlusIcon } from "@heroicons/react/24/outline";
import { Mail, Settings2 } from "lucide-react";
import { useMemo, useState } from "react";

import { HelpButton } from "@/components/help/HelpButton";
import NotificationSettingsPanel from "@/features/05-tenant-admin/tenant/components/BillingTabs/notifications/NotificationSettingsPanel";

import { columnDisplayNames } from "../constants/column-display-names";
import { columnVisibilityState } from "../constants/column-visibility-state";
import { TABLE_HEADING, TABLE_KEY } from "../constants/notifications-table.constant";
import { useFetchNotifications } from "../hooks/useFetchNotifications.hook";
import type { NotificationsMode } from "./NotificationsManagement";
import { NotificationComposeForm } from "./NotificationComposeForm";
import { getNotificationsTableColumns } from "./NotificationsTableColumns";
import { NotificationBulkActions } from "./notification-row-actions/NotificationBulkActions";

interface NotificationsTableProps {
  /** Current Manual/Auto mode. */
  mode: NotificationsMode;
  /** Callback to change the mode. */
  onModeChange: (mode: NotificationsMode) => void;
}

/**
 * Renders the notifications table with a single toolbar row (heading, help,
 * Manual/Auto switch on the left; search, column view, and create on the right)
 * followed by the data table with row selection (bulk delete) and CRUD actions.
 */
export const NotificationsTable = ({ mode, onModeChange }: NotificationsTableProps) => {
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
    <div className="space-y-4 pb-4 pt-[17px]">
      {/* Persistent toolbar: heading + help + switch (left), search + view + create (right) */}
      <div className="flex items-center justify-between gap-4">
        <div className="flex min-w-0 items-center gap-2">
          <DTHeading heading="Notifications" />
          <HelpButton guideId="tenant-notifications" />
          <div className="ml-1 inline-flex shrink-0 items-center gap-1 rounded-lg bg-muted px-1.5 py-1.5">
            <button
              type="button"
              onClick={() => onModeChange("manual")}
              className={cn(
                "inline-flex items-center justify-center gap-1.5 whitespace-nowrap rounded-md px-3 py-1.5 text-sm font-medium transition-all duration-200",
                mode === "manual"
                  ? "bg-background text-foreground shadow-sm"
                  : "text-muted-foreground hover:bg-accent hover:text-accent-foreground",
              )}
            >
              <Mail className="size-4 shrink-0" aria-hidden="true" />
              Manual
            </button>
            <button
              type="button"
              onClick={() => onModeChange("auto")}
              className={cn(
                "inline-flex items-center justify-center gap-1.5 whitespace-nowrap rounded-md px-3 py-1.5 text-sm font-medium transition-all duration-200",
                mode === "auto"
                  ? "bg-background text-foreground shadow-sm"
                  : "text-muted-foreground hover:bg-accent hover:text-accent-foreground",
              )}
            >
              <Settings2 className="size-4 shrink-0" aria-hidden="true" />
              Auto
            </button>
          </div>
        </div>

        <div className="flex shrink-0 items-center gap-2">
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

      {isLoading ? (
        <DataTableSkeleton />
      ) : mode === "auto" ? (
        <NotificationSettingsPanel />
      ) : (
        <>
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
        </>
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
    </div>
  );
};


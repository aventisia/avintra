import { Button } from "@avplatform/ui/buttons";
import { Dialog, DialogContent, DialogDefaultHeader } from "@avplatform/ui/dialog";
import { useDocumentTitle } from "@avplatform/ui/hooks";
import { cn } from "@avplatform/ui/lib";
import {
  TableCN,
  TableCNHeading,
  TableCNSkeleton,
  TableCNToolbar,
  useTableCN,
} from "@avplatform/ui/table-cn";
import { Mail, PlusIcon, Settings2 } from "lucide-react";
import { useMemo, useState } from "react";

import NotificationSettingsPanel from "@/features/05-tenant-admin/tenant/components/BillingTabs/notifications/NotificationSettingsPanel";

import {
  NOTIFICATIONS_INITIAL_STATE,
  NOTIFICATIONS_PAGE_SIZE_OPTIONS,
  NOTIFICATIONS_ROW_LABELS,
  TABLE_HEADING,
  TABLE_KEY,
} from "../constants/notifications-table.constant";
import { useFetchNotifications } from "../hooks/useFetchNotifications.hook";
import { NotificationComposeForm } from "./NotificationComposeForm";
import type { NotificationsMode } from "./NotificationsManagement";
import { getNotificationsTableColumns } from "./NotificationsTableColumns";
import { NotificationBulkActions } from "./notification-row-actions/NotificationBulkActions";

const PAGINATION_PROPS = {
  pageSizeOptions: NOTIFICATIONS_PAGE_SIZE_OPTIONS,
  rowLabels: NOTIFICATIONS_ROW_LABELS,
};

interface NotificationsTableProps {
  /** Current Manual/Auto mode. */
  mode: NotificationsMode;
  /** Callback to change the mode. */
  onModeChange: (mode: NotificationsMode) => void;
}

/**
 * Renders the notifications table with a toolbar row (heading, help and
 * Manual/Auto switch on the left, create on the right), followed by the table
 * with its search, view options, row selection (bulk delete), and CRUD actions.
 */
export const NotificationsTable = ({ mode, onModeChange }: NotificationsTableProps) => {
  // Set the document title
  useDocumentTitle(TABLE_HEADING);

  const { data, isLoading } = useFetchNotifications();

  const [isCreateOpen, setIsCreateOpen] = useState(false);

  const notifications = useMemo(() => data?.data ?? [], [data]);

  const columns = useMemo(() => getNotificationsTableColumns(), []);

  // Create a TableCN table; page, size, and sorting live in the URL
  const { table } = useTableCN({
    data: notifications,
    columns,
    getRowId: (row) => row.id,
    initialState: NOTIFICATIONS_INITIAL_STATE,
    persistKey: TABLE_KEY,
    searchColumns: ["title", "message"],
  });

  return (
    <div className="space-y-4 pb-4 pt-[17px]">
      {/* Persistent toolbar: heading, help and switch on the left, create on the right */}
      <div className="flex items-center justify-between gap-4">
        <div className="flex min-w-0 items-center gap-2">
          <TableCNHeading heading="Notifications" />
          <div className="ml-1 inline-flex shrink-0 items-center gap-1 rounded-lg bg-muted px-1.5 py-1.5">
            <button
              type="button"
              onClick={() => onModeChange("manual")}
              className={cn(
                "inline-flex items-center justify-center gap-1.5 whitespace-nowrap rounded-md px-3 py-1.5 text-sm font-medium transition-all duration-200",
                mode === "manual"
                  ? "bg-surface text-ink ring-1 ring-line"
                  : "text-muted-foreground hover:bg-hover hover:text-ink",
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
                  ? "bg-surface text-ink ring-1 ring-line"
                  : "text-muted-foreground hover:bg-hover hover:text-ink",
              )}
            >
              <Settings2 className="size-4 shrink-0" aria-hidden="true" />
              Auto
            </button>
          </div>
        </div>

        <div className="flex shrink-0 items-center gap-2">
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
        <TableCNSkeleton columnCount={8} />
      ) : mode === "auto" ? (
        <NotificationSettingsPanel />
      ) : (
        // Table with its search, view options, pagination footer, and bulk actions
        <TableCN
          table={table}
          label={TABLE_HEADING}
          paginationProps={PAGINATION_PROPS}
          actionBar={<NotificationBulkActions table={table} />}
        >
          <TableCNToolbar table={table} searchPlaceholder="Search notifications..." />
        </TableCN>
      )}

      {/* Create notification dialog (right side) */}
      <Dialog open={isCreateOpen} onOpenChange={setIsCreateOpen}>
        <DialogContent side={"right"} className="!max-w-[36rem]">
          <DialogDefaultHeader className="px-3.5 py-4 text-heading" heading="Create notification" />
          <NotificationComposeForm onSuccess={() => setIsCreateOpen(false)} />
        </DialogContent>
      </Dialog>
    </div>
  );
};

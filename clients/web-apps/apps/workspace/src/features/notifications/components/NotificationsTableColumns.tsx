import { FALLBACK_VALUE } from "@avplatform/ui/constants";
import { TableCNColumnHeader, getTableCNSelectColumn } from "@avplatform/ui/table-cn";
import { formatDate } from "@avplatform/ui/utils";
import { ColumnDef, HeaderContext } from "@tanstack/react-table";

import { getRowActionsColumn } from "@/utils/get-row-actions-column.util";

import { getColumnName } from "../constants/column-display-names";
import { NotificationDto } from "../dtos/notification.dto";
import { NotificationRowActions } from "./notification-row-actions/NotificationRowActions";

const renderHeader =
  (columnKey: string) =>
  ({ column }: HeaderContext<NotificationDto, unknown>) => (
    <TableCNColumnHeader column={column} label={getColumnName(columnKey)} />
  );

/**
 * Builds the array of table columns for the notifications table.
 */
export const getNotificationsTableColumns = (): ColumnDef<NotificationDto>[] => [
  getTableCNSelectColumn<NotificationDto>({
    enableHiding: true,
    meta: { label: getColumnName("select") },
  }),
  {
    accessorKey: "title",
    meta: { label: getColumnName("title") },
    header: renderHeader("title"),
    cell: ({ row }) => {
      const title = row.getValue<string | null>("title");
      return (
        <div className="w-auto max-w-[24rem] truncate font-medium">{title || FALLBACK_VALUE}</div>
      );
    },
  },
  {
    accessorKey: "message",
    meta: { label: getColumnName("message") },
    header: renderHeader("message"),
    cell: ({ row }) => {
      const message = row.getValue<string>("message");
      return <div className="w-auto max-w-[24rem] truncate font-medium">{message}</div>;
    },
  },
  {
    accessorKey: "type",
    meta: { label: getColumnName("type") },
    header: renderHeader("type"),
    cell: ({ row }) => {
      const type = row.getValue<string>("type");
      return <div className="w-auto truncate font-medium">{type || FALLBACK_VALUE}</div>;
    },
  },
  {
    accessorKey: "status",
    meta: { label: getColumnName("status") },
    header: renderHeader("status"),
    cell: ({ row }) => {
      const status = row.getValue<string>("status");
      return <div className="w-auto truncate font-medium">{status || FALLBACK_VALUE}</div>;
    },
  },
  {
    accessorKey: "recipientCount",
    meta: { label: getColumnName("recipientCount") },
    header: renderHeader("recipientCount"),
    cell: ({ row }) => {
      const recipientCount = row.getValue<number>("recipientCount");
      return (
        <div className="w-auto truncate font-mono font-medium tabular-nums">
          {recipientCount ?? FALLBACK_VALUE}
        </div>
      );
    },
  },
  {
    accessorKey: "createdOn",
    meta: { label: getColumnName("createdOn") },
    header: renderHeader("createdOn"),
    cell: ({ row }) => {
      const createdOn = row.getValue<string | null>("createdOn");
      const formattedDate = formatDate(createdOn, true);
      if (!formattedDate || formattedDate === "01 Jan 0001") {
        return <div className="truncate font-medium">{FALLBACK_VALUE}</div>;
      }
      return <div className="truncate font-mono font-medium tabular-nums">{formattedDate}</div>;
    },
  },
  getRowActionsColumn<NotificationDto>({
    actions: ({ row }) => (
      <NotificationRowActions rowId={row.original.id} status={row.original.status} />
    ),
  }),
];

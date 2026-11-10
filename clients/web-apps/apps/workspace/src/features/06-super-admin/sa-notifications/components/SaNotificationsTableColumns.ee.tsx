import { FALLBACK_VALUE } from "@avplatform/ui/constants";
import { TableCNColumnHeader, getTableCNSelectColumn } from "@avplatform/ui/table-cn";
import { formatDate } from "@avplatform/ui/utils";
import { ColumnDef } from "@tanstack/react-table";

import { getRowActionsColumn } from "@/utils/get-row-actions-column.util";

import { SaNotificationDto } from "../dtos/sa-notification.dto.ee";
import { SaNotificationRowActions } from "./sa-notification-row-actions/SaNotificationRowActions.ee";

/**
 * Builds the array of table columns for the Super Admin notifications table.
 */
export const getSaNotificationsTableColumns = (): ColumnDef<SaNotificationDto>[] => [
  getTableCNSelectColumn<SaNotificationDto>({
    enableHiding: true,
    meta: { label: "Select row" },
  }),
  {
    accessorKey: "title",
    meta: { label: "Title" },
    header: ({ column }) => <TableCNColumnHeader column={column} label="Title" />,
    cell: ({ row }) => {
      const title = row.getValue<string | null>("title");
      return <div className="w-auto truncate font-medium">{title || FALLBACK_VALUE}</div>;
    },
  },
  {
    accessorKey: "message",
    meta: { label: "Message" },
    header: ({ column }) => <TableCNColumnHeader column={column} label="Message" />,
    cell: ({ row }) => {
      const message = row.getValue<string>("message");
      return <div className="w-auto max-w-[24rem] truncate font-medium">{message}</div>;
    },
  },
  {
    accessorKey: "type",
    meta: { label: "Type" },
    header: ({ column }) => <TableCNColumnHeader column={column} label="Type" />,
    cell: ({ row }) => {
      const type = row.getValue<string>("type");
      return <div className="w-auto truncate font-medium">{type || FALLBACK_VALUE}</div>;
    },
  },
  {
    accessorKey: "status",
    meta: { label: "Status" },
    header: ({ column }) => <TableCNColumnHeader column={column} label="Status" />,
    cell: ({ row }) => {
      const status = row.getValue<string>("status");
      return <div className="w-auto truncate font-medium">{status || FALLBACK_VALUE}</div>;
    },
  },
  {
    accessorKey: "tenantCount",
    meta: { label: "Tenants" },
    header: ({ column }) => <TableCNColumnHeader column={column} label="Tenants" />,
    cell: ({ row }) => {
      const tenantCount = row.getValue<number>("tenantCount");
      return (
        <div className="font-mono tabular-nums w-auto truncate font-medium">
          {tenantCount ?? FALLBACK_VALUE}
        </div>
      );
    },
  },
  {
    accessorKey: "recipientCount",
    meta: { label: "Recipients" },
    header: ({ column }) => <TableCNColumnHeader column={column} label="Recipients" />,
    cell: ({ row }) => {
      const recipientCount = row.getValue<number>("recipientCount");
      return (
        <div className="font-mono tabular-nums w-auto truncate font-medium">
          {recipientCount ?? FALLBACK_VALUE}
        </div>
      );
    },
  },
  {
    accessorKey: "createdOn",
    meta: { label: "Created" },
    header: ({ column }) => <TableCNColumnHeader column={column} label="Created" />,
    cell: ({ row }) => {
      const createdOn = row.getValue<string | null>("createdOn");
      const formattedDate = formatDate(createdOn, true);
      if (!formattedDate || formattedDate === "01 Jan 0001") {
        return <div className="font-mono tabular-nums truncate font-medium">{FALLBACK_VALUE}</div>;
      }
      return <div className="font-mono tabular-nums truncate font-medium">{formattedDate}</div>;
    },
  },
  getRowActionsColumn<SaNotificationDto>({
    actions: ({ row }) => (
      <SaNotificationRowActions rowId={row.original.id} status={row.original.status} />
    ),
  }),
];

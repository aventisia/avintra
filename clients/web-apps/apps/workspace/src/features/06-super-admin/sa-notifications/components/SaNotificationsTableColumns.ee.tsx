import { Checkbox } from "@avplatform/ui";
import { FALLBACK_VALUE } from "@avplatform/ui/constants";
import { DTColumnHeader, createDTActionsColumn } from "@avplatform/ui/data-table";
import { formatDate } from "@avplatform/ui/utils";
import { ColumnDef } from "@tanstack/react-table";

import { SA_NOTIFICATIONS_TABLE_KEY } from "../constants/sa-notifications-table.constant.ee";
import { SaNotificationDto } from "../dtos/sa-notification.dto.ee";
import { SaNotificationRowActions } from "./sa-notification-row-actions/SaNotificationRowActions.ee";

/**
 * Builds the array of table columns for the Super Admin notifications table.
 */
export const getSaNotificationsTableColumns = (): ColumnDef<SaNotificationDto>[] => [
  {
    accessorKey: "selectRow",
    header: ({ table }) => (
      <Checkbox
        checked={
          table.getIsAllPageRowsSelected() || (table.getIsSomePageRowsSelected() && "indeterminate")
        }
        onCheckedChange={(value) => table.toggleAllPageRowsSelected(!!value)}
        aria-label="Select all"
        className="translate-y-[2px]"
      />
    ),
    cell: ({ row }) => (
      <Checkbox
        checked={row.getIsSelected()}
        onCheckedChange={(value) => row.toggleSelected(!!value)}
        onClick={(e) => e.stopPropagation()}
        aria-label="Select row"
        className="translate-y-[2px]"
      />
    ),
    enableSorting: false,
  },
  {
    accessorKey: "title",
    header: ({ column }) => (
      <DTColumnHeader tableKey={SA_NOTIFICATIONS_TABLE_KEY} column={column} title="Title" />
    ),
    cell: ({ row }) => {
      const title = row.getValue<string | null>("title");
      return <div className="w-auto truncate font-medium">{title || FALLBACK_VALUE}</div>;
    },
  },
  {
    accessorKey: "message",
    header: ({ column }) => (
      <DTColumnHeader tableKey={SA_NOTIFICATIONS_TABLE_KEY} column={column} title="Message" />
    ),
    cell: ({ row }) => {
      const message = row.getValue<string>("message");
      return <div className="w-auto max-w-[24rem] truncate font-medium">{message}</div>;
    },
  },
  {
    accessorKey: "type",
    header: ({ column }) => (
      <DTColumnHeader tableKey={SA_NOTIFICATIONS_TABLE_KEY} column={column} title="Type" />
    ),
    cell: ({ row }) => {
      const type = row.getValue<string>("type");
      return <div className="w-auto truncate font-medium">{type || FALLBACK_VALUE}</div>;
    },
  },
  {
    accessorKey: "status",
    header: ({ column }) => (
      <DTColumnHeader tableKey={SA_NOTIFICATIONS_TABLE_KEY} column={column} title="Status" />
    ),
    cell: ({ row }) => {
      const status = row.getValue<string>("status");
      return <div className="w-auto truncate font-medium">{status || FALLBACK_VALUE}</div>;
    },
  },
  {
    accessorKey: "tenantCount",
    header: ({ column }) => (
      <DTColumnHeader tableKey={SA_NOTIFICATIONS_TABLE_KEY} column={column} title="Tenants" />
    ),
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
    header: ({ column }) => (
      <DTColumnHeader tableKey={SA_NOTIFICATIONS_TABLE_KEY} column={column} title="Recipients" />
    ),
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
    header: ({ column }) => (
      <DTColumnHeader tableKey={SA_NOTIFICATIONS_TABLE_KEY} column={column} title="Created" />
    ),
    cell: ({ row }) => {
      const createdOn = row.getValue<string | null>("createdOn");
      const formattedDate = formatDate(createdOn, true);
      if (!formattedDate || formattedDate === "01 Jan 0001") {
        return <div className="font-mono tabular-nums truncate font-medium">{FALLBACK_VALUE}</div>;
      }
      return <div className="font-mono tabular-nums truncate font-medium">{formattedDate}</div>;
    },
  },
  createDTActionsColumn<SaNotificationDto>({
    renderCell: (notification) => (
      <SaNotificationRowActions rowId={notification.id} status={notification.status} />
    ),
  }),
];

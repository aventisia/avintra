import { Checkbox } from "@avplatform/ui";
import { DTColumnHeader, createDTActionsColumn } from "@avplatform/ui/data-table";
import { formatDate } from "@avplatform/ui/utils";
import { ColumnDef } from "@tanstack/react-table";
import { format } from "date-fns";
import { NavLink } from "react-router-dom";

import { TABLE_KEY } from "../constants";
import { getColumnName } from "../constants/column-display-names";
import { QueuesTableDto } from "../dtos/queues-table-dto";
import { QueueProcessingModeEnum } from "../enums/queue-processing-mode-enum";
import { QueueRowActions } from "./queue-row-actions/QueueRowActions";

/**
 * User-facing label for a queue's processing mode. The stored enum value for the
 * non-FIFO mode is "Manual", but it is branded as "Flexible" in the UI, so map it
 * to the display label instead of showing the raw stored value.
 */
const processingModeLabel: Record<QueueProcessingModeEnum, string> = {
  [QueueProcessingModeEnum.Fifo]: "Fifo",
  [QueueProcessingModeEnum.Manual]: "Flexible",
};

/**
 * Array of table columns for the queues table.
 * Each column object contains an accessorKey, header component, and cell component.
 */
export const queuesTableColumns = (): ColumnDef<QueuesTableDto>[] => [
  {
    accessorKey: "id",
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
        aria-label="Select row"
        className="translate-y-[2px]"
      />
    ),
    enableSorting: false,
  },
  {
    accessorKey: "name",
    header: ({ column }) => (
      <DTColumnHeader tableKey={TABLE_KEY} column={column} title={getColumnName("name")} />
    ),
    cell: ({ row }) => {
      const queueId = row.original.id;
      const queueName = row.getValue<string>("name") ?? "";
      return (
        <div className="flex  items-center max-w-80 gap-3 ">
          <NavLink
            to={`/configure/queues/work-items/${queueId}?name=${encodeURIComponent(queueName)}`}
            onClick={(e) => e.stopPropagation()}
            className="w-auto truncate font-medium text-foreground underline-offset-4 hover:text-primary hover:underline"
            title="View work items"
          >
            {row.getValue<string>("name")}
          </NavLink>
          <p className="bg-muted border text-nowrap p-1 text-2xs leading-none text-ink-2 rounded-sm">
            {row.original.accessLevel?.replace(/([A-Z])/g, " $1")}
          </p>
        </div>
      );
    },
  },
  {
    accessorKey: "type",
    header: ({ column }) => (
      <DTColumnHeader tableKey={TABLE_KEY} column={column} title={getColumnName("type")} />
    ),
    cell: ({ row }) => (
      <div className="w-auto truncate font-medium">{row.getValue("type") ?? "--"}</div>
    ),
  },
  {
    accessorKey: "processingMode",
    header: ({ column }) => (
      <DTColumnHeader
        tableKey={TABLE_KEY}
        column={column}
        title={getColumnName("processingMode")}
      />
    ),
    cell: ({ row }) => {
      const value = row.getValue<QueueProcessingModeEnum | null>("processingMode");
      return (
        <div className="w-auto truncate font-medium">
          {value ? (processingModeLabel[value] ?? value) : "--"}
        </div>
      );
    },
  },
  {
    accessorKey: "agentsNames",
    header: ({ column }) => (
      <DTColumnHeader tableKey={TABLE_KEY} column={column} title={getColumnName("agentsNames")} />
    ),
    cell: ({ row }) => {
      const agents = row.getValue<string[]>("agentsNames") ?? [];
      return (
        <div className="w-auto max-w-60 truncate font-medium">
          {agents.length > 0 ? agents.join(", ") : "--"}
        </div>
      );
    },
  },
  {
    accessorKey: "total",
    header: ({ column }) => (
      <DTColumnHeader tableKey={TABLE_KEY} column={column} title={getColumnName("total")} />
    ),
    cell: ({ row }) => (
      <div className="w-auto truncate font-medium">{row.getValue("total") ?? 0}</div>
    ),
  },
  {
    accessorKey: "lastModifiedOn",
    header: ({ column }) => (
      <DTColumnHeader
        tableKey={TABLE_KEY}
        className="w-[7rem]"
        column={column}
        title={getColumnName("lastModifiedOn")}
      />
    ),
    cell: ({ row }) => (
      <div className="w-auto truncate font-medium font-mono tabular-nums">
        {row.getValue("lastModifiedOn")
          ? format(row.getValue("lastModifiedOn"), "dd MMM yyyy, h:mm a")
          : "--"}
      </div>
    ),
  },
  {
    accessorKey: "createdBy",
    header: ({ column }) => (
      <DTColumnHeader tableKey={TABLE_KEY} column={column} title={getColumnName("createdBy")} />
    ),
    cell: ({ row }) => (
      <div className="w-auto truncate font-medium">{row.getValue("createdBy")}</div>
    ),
  },
  {
    accessorKey: "createdOn",
    header: ({ column }) => (
      <DTColumnHeader
        tableKey={TABLE_KEY}
        className="w-[7rem]"
        column={column}
        title={getColumnName("createdOn")}
      />
    ),
    cell: ({ row }) => (
      <div className="w-auto truncate font-medium font-mono tabular-nums">
        {formatDate(row.getValue("createdOn"))}
      </div>
    ),
  },
  createDTActionsColumn<QueuesTableDto>({
    renderCell: (row) => (
      <QueueRowActions
        rowId={row.id ?? "rowId"}
        queueName={row.name ?? ""}
        accessLevel={row.accessLevel}
        isTenantWideAccess={row.isTenantWideAccess || false}
        isResourceAccessRestricted={row.isResourceAccessRestricted || false}
      />
    ),
  }),
];

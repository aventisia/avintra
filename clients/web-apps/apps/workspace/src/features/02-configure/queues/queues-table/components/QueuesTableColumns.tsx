import { Checkbox } from "@avplatform/ui";
import { DTColumnHeader, createDTActionsColumn } from "@avplatform/ui/data-table";
import { formatDate } from "@avplatform/ui/utils";
import { ColumnDef } from "@tanstack/react-table";
import { format } from "date-fns";

import { TABLE_KEY } from "../constants";
import { getColumnName } from "../constants/column-display-names";
import { QueuesTableDto } from "../dtos/queues-table-dto";
import { QueueRowActions } from "./queue-row-actions/QueueRowActions";

/**
 * Array of table columns for the queues table.
 * Each column object contains an accessorKey, header component, and cell component.
 */
export const queuesTableColumns = (isSharedTab: boolean): ColumnDef<QueuesTableDto>[] => [
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
    cell: ({ row }) => (
      <div className="flex  items-center max-w-80 gap-3 ">
        <span className="w-auto truncate font-medium">{row.getValue<string>("name")}</span>
        {isSharedTab && (
          <p className="bg-muted border text-nowrap p-1 text-2xs leading-none text-primary rounded-full">
            {row.original.accessLevel?.replace(/([A-Z])/g, " $1")}
          </p>
        )}
      </div>
    ),
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
      <DTColumnHeader tableKey={TABLE_KEY} column={column} title={getColumnName("processingMode")} />
    ),
    cell: ({ row }) => (
      <div className="w-auto truncate font-medium">{row.getValue("processingMode") ?? "--"}</div>
    ),
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
      <div className="w-auto truncate font-medium">
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
      <div className="w-auto truncate font-medium">{formatDate(row.getValue("createdOn"))}</div>
    ),
  },
  createDTActionsColumn<QueuesTableDto>({
    renderCell: (row) => (
      <QueueRowActions
        rowId={row.id ?? "rowId"}
        queueName={row.name ?? ""}
        accessLevel={row.accessLevel}
        isTenantWideAccess={row.isTenantWideAccess || false}
      />
    ),
  }),
];

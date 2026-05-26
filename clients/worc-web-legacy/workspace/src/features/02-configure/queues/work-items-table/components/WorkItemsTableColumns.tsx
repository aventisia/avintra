import { Badge } from "@aventisia/ui/badge";
import { DTColumnHeader } from "@aventisia/ui/data-table";
import { dateFormatter } from "@aventisia/ui/utils";
import { ColumnDef } from "@tanstack/react-table";

import { TABLE_KEY } from "../constants";
import { statusColor } from "../constants/column-display-names";
import { QueueWorkItemDto } from "../dtos/queue-work-item-dto";

import { WorkItemRowActions } from "./WorkItemRowActions";

/**
 * Array of table columns for the WorkItems table.
 * Each column object contains an accessorKey, header component, and cell component.
 */
export const workItemsTableColumns: ColumnDef<QueueWorkItemDto>[] = [
  {
    accessorKey: "id",
    header: ({ column }) => (
      <DTColumnHeader tableKey={TABLE_KEY} column={column} title={"Id"} />
    ),
    cell: ({ row }) => (
      <div className="w-auto truncate font-medium">{row.getValue("id")}</div>
    ),
    enableSorting: false,
  },
  {
    accessorKey: "status",
    header: ({ column }) => (
      <DTColumnHeader tableKey={TABLE_KEY} column={column} title={"Status"} />
    ),
    cell: ({ row }) => (
      <Badge
        className={
          row.original.status
            ? statusColor[row.original.status]
            : "bg-slate-200 text-slate-600"
        }
      >
        {row.original.status?.replace(/([A-Z])/g, " $1")}
      </Badge>
    ),
  },
  {
    accessorKey: "createdBy",
    header: ({ column }) => (
      <DTColumnHeader
        tableKey={TABLE_KEY}
        column={column}
        title={"Created By"}
      />
    ),
    cell: ({ row }) => (
      <div className="w-auto truncate font-medium">
        {row.getValue("createdBy")}
      </div>
    ),
  },
  {
    accessorKey: "createdOn",
    header: ({ column }) => (
      <DTColumnHeader
        tableKey={TABLE_KEY}
        column={column}
        title={"Created On"}
      />
    ),
    cell: ({ row }) => (
      <div className="w-auto truncate font-medium">
        {dateFormatter(row.getValue("createdOn"))}
      </div>
    ),
  },
  {
    id: "actions",
    cell: ({ row }) => (
      // Render the queues row actions component
      <WorkItemRowActions rowId={row.original.id ?? "rowId"} />
    ),
  },
];

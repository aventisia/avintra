import { Checkbox } from "@aventisia/ui";
import { DTColumnHeader } from "@aventisia/ui/data-table";
import { dateFormatter } from "@aventisia/ui/utils";
import { ColumnDef } from "@tanstack/react-table";

import { getColumnName } from "../constants/column-display-names";
import { QueuesTableDto } from "../dtos/queues-table-dto";

import { QueueRowActions } from "./queue-row-actions/QueueRowActions";
import { WorkItemsTableCellLink } from "./WorkItemsTableCellLink";

/**
 * Array of table columns for the queues table.
 * Each column object contains an accessorKey, header component, and cell component.
 */
export const queuesTableColumns: ColumnDef<QueuesTableDto>[] = [
  {
    accessorKey: "id",
    header: ({ table }) => (
      <Checkbox
        checked={
          table.getIsAllPageRowsSelected() ||
          (table.getIsSomePageRowsSelected() && "indeterminate")
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
      <DTColumnHeader column={column} title={getColumnName("name")} />
    ),
    cell: ({ row }) => (
      <WorkItemsTableCellLink rowId={row.original.id}>
        {row.getValue<string>("name")}
      </WorkItemsTableCellLink>
    ),
  },

  {
    accessorKey: "inprogressCount",
    header: ({ column }) => (
      <DTColumnHeader
        column={column}
        title={getColumnName("inprogressCount") ?? 0}
      />
    ),
    cell: ({ row }) => (
      <div className="w-auto truncate font-medium">
        {row.getValue("inprogressCount") ?? 0}
      </div>
    ),
  },

  {
    accessorKey: "pendingCount",
    header: ({ column }) => (
      <DTColumnHeader column={column} title={getColumnName("pendingCount")} />
    ),
    cell: ({ row }) => (
      <div className="w-auto truncate font-medium">
        {row.getValue("pendingCount") ?? 0}
      </div>
    ),
  },

  {
    accessorKey: "completedCount",
    header: ({ column }) => (
      <DTColumnHeader
        column={column}
        title={getColumnName("completedCount") ?? 0}
      />
    ),
    cell: ({ row }) => (
      <div className="w-auto truncate font-medium">
        {row.getValue("completedCount") ?? 0}
      </div>
    ),
  },

  {
    accessorKey: "failedCount",
    header: ({ column }) => (
      <DTColumnHeader
        column={column}
        title={getColumnName("failedCount") ?? 0}
      />
    ),
    cell: ({ row }) => (
      <div className="w-auto truncate font-medium">
        {row.getValue("failedCount") ?? 0}
      </div>
    ),
  },

  {
    accessorKey: "totalCount",
    header: ({ column }) => (
      <DTColumnHeader
        column={column}
        title={getColumnName("totalCount") ?? 0}
      />
    ),
    cell: ({ row }) => (
      <div className="w-auto truncate font-medium">
        {row.getValue("totalCount") ?? 0}
      </div>
    ),
  },

  {
    accessorKey: "lastModifiedOn",
    header: ({ column }) => (
      <DTColumnHeader
        className="w-[7rem]"
        column={column}
        title={getColumnName("lastModifiedOn")}
      />
    ),
    cell: ({ row }) => (
      <div className="w-auto truncate font-medium">
        {dateFormatter(row.getValue("lastModifiedOn"))}
      </div>
    ),
  },

  {
    accessorKey: "createdBy",
    header: ({ column }) => (
      <DTColumnHeader column={column} title={getColumnName("createdBy")} />
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
        className="w-[7rem]"
        column={column}
        title={getColumnName("createdOn")}
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
      <QueueRowActions rowId={row.original.id ?? "rowId"} />
    ),
  },
];

import { Checkbox } from "@aventisia/ui";
import { DTColumnHeader } from "@aventisia/ui/data-table";
import { dateFormatter } from "@aventisia/ui/utils";
import { ColumnDef } from "@tanstack/react-table";
import { format } from "date-fns";

import { TABLE_KEY } from "../constants";
import { getColumnName } from "../constants/column-display-names";
import { QueuesTableDto } from "../dtos/queues-table-dto";

import { QueueRowActions } from "./queue-row-actions/QueueRowActions";
import { QueuesTableCellLink } from "./QueuesTableCellLink";

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
      <DTColumnHeader
        tableKey={TABLE_KEY}
        column={column}
        title={getColumnName("name")}
      />
    ),
    cell: ({ row }) => (
      <QueuesTableCellLink rowId={row.original.id}>
        {row.getValue<string>("name")}
      </QueuesTableCellLink>
    ),
  },
  {
    accessorKey: "type",
    header: ({ column }) => (
      <DTColumnHeader
        tableKey={TABLE_KEY}
        column={column}
        title={getColumnName("type")}
      />
    ),
    cell: ({ row }) => (
      <div className="w-auto truncate font-medium">
        {row.getValue("type") ?? "--"}
      </div>
    ),
  },
  {
    accessorKey: "inProgress",
    header: ({ column }) => (
      <DTColumnHeader
        tableKey={TABLE_KEY}
        column={column}
        title={getColumnName("inProgress")}
      />
    ),
    cell: ({ row }) => (
      <div className="w-auto truncate font-medium">
        {row.getValue("inProgress") ?? 0}
      </div>
    ),
  },
  {
    accessorKey: "pending",
    header: ({ column }) => (
      <DTColumnHeader
        tableKey={TABLE_KEY}
        column={column}
        title={getColumnName("pending")}
      />
    ),
    cell: ({ row }) => (
      <div className="w-auto truncate font-medium">
        {row.getValue("pending") ?? 0}
      </div>
    ),
  },
  {
    accessorKey: "completed",
    header: ({ column }) => (
      <DTColumnHeader
        tableKey={TABLE_KEY}
        column={column}
        title={getColumnName("completed")}
      />
    ),
    cell: ({ row }) => (
      <div className="w-auto truncate font-medium">
        {row.getValue("completed") ?? 0}
      </div>
    ),
  },
  {
    accessorKey: "failed",
    header: ({ column }) => (
      <DTColumnHeader
        tableKey={TABLE_KEY}
        column={column}
        title={getColumnName("failed")}
      />
    ),
    cell: ({ row }) => (
      <div className="w-auto truncate font-medium">
        {row.getValue("failed") ?? 0}
      </div>
    ),
  },
  {
    accessorKey: "total",
    header: ({ column }) => (
      <DTColumnHeader
        tableKey={TABLE_KEY}
        column={column}
        title={getColumnName("total")}
      />
    ),
    cell: ({ row }) => (
      <div className="w-auto truncate font-medium">
        {row.getValue("total") ?? 0}
      </div>
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
      <DTColumnHeader
        tableKey={TABLE_KEY}
        column={column}
        title={getColumnName("createdBy")}
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
      <QueueRowActions
        rowId={row.original.id ?? "rowId"}
        queueName={row.original.name ?? ""}
        type={row.original.type ?? ""}
      />
    ),
  },
];

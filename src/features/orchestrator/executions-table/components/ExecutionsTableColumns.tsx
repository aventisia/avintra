import { Checkbox } from "@/react-toolkit/ui/checkbox";
import { DTColumnHeader } from "@/react-toolkit/ui/data-table/DTColumnHeader";
import { ColumnDef } from "@tanstack/react-table";

import { getColumnName } from "../constants/column-display-names";
import { ExecutionsTableDto } from "../dtos/executions-table-dto";
import { ExecutionRowActions } from "./execution-row-actions/ExecutionRowActions";
import { dateFormat, dateFormatDistanceToNow } from "@/react-toolkit/constants";

export const executionsTableColumns: ColumnDef<ExecutionsTableDto>[] = [
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
      <div className="w-auto truncate font-medium">{row.getValue("name")}</div>
    ),
  },

  {
    accessorKey: "status",
    header: ({ column }) => (
      <DTColumnHeader column={column} title={getColumnName("status")} />
    ),
    cell: ({ row }) => (
      <div className="w-auto truncate font-medium">
        {row.getValue("status") ?? 0}
      </div>
    ),
  },

  {
    accessorKey: "startTime",
    header: ({ column }) => (
      <DTColumnHeader
        className="w-[7rem]"
        column={column}
        title={getColumnName("startTime")}
      />
    ),
    cell: ({ row }) => (
      <div className="w-auto truncate font-medium">
        {dateFormatDistanceToNow(row.getValue("startTime"))}
      </div>
    ),
  },

  {
    accessorKey: "endTime",
    header: ({ column }) => (
      <DTColumnHeader
        className="w-[7rem]"
        column={column}
        title={getColumnName("endTime")}
      />
    ),
    cell: ({ row }) => (
      <div className="w-auto truncate font-medium">
        {dateFormatDistanceToNow(row.getValue("endTime"))}
      </div>
    ),
  },

  {
    accessorKey: "duration",
    header: ({ column }) => (
      <DTColumnHeader column={column} title={getColumnName("duration") ?? 0} />
    ),
    cell: ({ row }) => (
      <div className="w-auto truncate font-medium">
        {row.getValue("duration") ?? "-"}
      </div>
    ),
  },

  {
    accessorKey: "retryCount",
    header: ({ column }) => (
      <DTColumnHeader
        column={column}
        title={getColumnName("retryCount") ?? 0}
      />
    ),
    cell: ({ row }) => (
      <div className="w-auto truncate font-medium">
        {row.getValue("retryCount") ?? 0}
      </div>
    ),
  },

  {
    accessorKey: "executionLogs",
    header: ({ column }) => (
      <DTColumnHeader
        column={column}
        title={getColumnName("executionLogs") ?? 0}
      />
    ),
    cell: ({ row }) => (
      <div className="w-auto truncate font-medium">
        {row.getValue("executionLogs") ?? 0}
      </div>
    ),
  },

  {
    accessorKey: "versionNumber",
    header: ({ column }) => (
      <DTColumnHeader
        column={column}
        title={getColumnName("versionNumber") ?? 0}
      />
    ),
    cell: ({ row }) => (
      <div className="w-auto truncate font-medium">
        {`v${row.getValue("versionNumber") ?? 0}`}
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
        {dateFormat(row.getValue("createdOn"))}
      </div>
    ),
  },
  {
    id: "actions",
    cell: ({ row }) => (
      // Render the execution row actions component
      <ExecutionRowActions
        row={row.original}
        rowId={row.original?.id ?? "rowid"}
      />
    ),
  },
];

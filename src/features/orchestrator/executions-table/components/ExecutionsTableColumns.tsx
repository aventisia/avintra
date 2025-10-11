// import { Checkbox } from "@aventisia/ui";
import { DTColumnHeader } from "@aventisia/ui/data-table";
import { dateFormatter } from "@aventisia/ui/utils";
import { ColumnDef } from "@tanstack/react-table";
import { format } from "date-fns";

import { TABLE_KEY } from "../constants";
import { getColumnName } from "../constants/column-display-names";
import { ExecutionsTableDto } from "../dtos/executions-table-dto";

// import { ExecutionRowActions } from "./execution-row-actions/ExecutionRowActions";

export const executionsTableColumns: ColumnDef<ExecutionsTableDto>[] = [
  // {
  //   accessorKey: "id",
  //   header: ({ table }) => (
  //     <Checkbox
  //       checked={
  //         table.getIsAllPageRowsSelected() ||
  //         (table.getIsSomePageRowsSelected() && "indeterminate")
  //       }
  //       onCheckedChange={(value) => table.toggleAllPageRowsSelected(!!value)}
  //       aria-label="Select all"
  //       className="translate-y-[2px]"
  //     />
  //   ),
  //   cell: ({ row }) => (
  //     <Checkbox
  //       checked={row.getIsSelected()}
  //       onCheckedChange={(value) => row.toggleSelected(!!value)}
  //       aria-label="Select row"
  //       className="translate-y-[2px]"
  //     />
  //   ),
  //   enableSorting: false,
  // },
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
      <div className="w-auto truncate font-medium">{row.getValue("name")}</div>
    ),
  },
  {
    accessorKey: "versionNumber",
    header: ({ column }) => (
      <DTColumnHeader
        tableKey={TABLE_KEY}
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
    accessorKey: "status",
    header: ({ column }) => (
      <DTColumnHeader
        tableKey={TABLE_KEY}
        column={column}
        title={getColumnName("status")}
      />
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
        tableKey={TABLE_KEY}
        className="w-[7rem]"
        column={column}
        title={getColumnName("startTime")}
      />
    ),
    cell: ({ row }) => (
      <div className="w-auto truncate font-medium">
        {format(row.getValue("startTime"), "dd MMM yyyy, h:mm:ss a")}
      </div>
    ),
  },

  {
    accessorKey: "endTime",
    header: ({ column }) => (
      <DTColumnHeader
        tableKey={TABLE_KEY}
        className="w-[7rem]"
        column={column}
        title={getColumnName("endTime")}
      />
    ),
    cell: ({ row }) => (
      <div className="w-auto truncate font-medium">
        {format(row.getValue("endTime"), "dd MMM yyyy, h:mm:ss a")}
      </div>
    ),
  },

  {
    accessorKey: "duration",
    header: ({ column }) => (
      <DTColumnHeader
        tableKey={TABLE_KEY}
        column={column}
        title={getColumnName("duration") ?? 0}
      />
    ),
    cell: ({ row }) => (
      <div className="w-auto truncate font-medium">
        {Number(row.getValue("duration")).toLocaleString("en-US", {
          maximumFractionDigits: 2,
        }) ?? "-"}
      </div>
    ),
  },

  {
    accessorKey: "retryCount",
    header: ({ column }) => (
      <DTColumnHeader
        tableKey={TABLE_KEY}
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

  // {
  //   accessorKey: "executionLogs",
  //   header: ({ column }) => (
  //     <DTColumnHeader
  //       tableKey={TABLE_KEY}
  //       column={column}
  //       title={getColumnName("executionLogs") ?? 0}
  //     />
  //   ),
  //   cell: ({ row }) => (
  //     <div className="w-auto truncate font-medium">
  //       {row.getValue("executionLogs") ?? 0}
  //     </div>
  //   ),
  // },

  {
    accessorKey: "executedBy",
    header: ({ column }) => (
      <DTColumnHeader
        tableKey={TABLE_KEY}
        column={column}
        title={getColumnName("executedBy")}
      />
    ),
    cell: ({ row }) => (
      <div className="w-auto truncate font-medium">
        {row.getValue("executedBy")}
      </div>
    ),
  },
  {
    accessorKey: "executedOn",
    header: ({ column }) => (
      <DTColumnHeader
        tableKey={TABLE_KEY}
        className="w-[7rem]"
        column={column}
        title={getColumnName("executedOn")}
      />
    ),
    cell: ({ row }) => (
      <div className="w-auto truncate font-medium">
        {dateFormatter(row.getValue("executedOn"))}
      </div>
    ),
  },
  // {
  //   id: "actions",
  //   cell: ({ row }) => (
  //     // Render the execution row actions component
  //     <ExecutionRowActions
  //       row={row.original}
  //       rowId={row.original?.id ?? "rowid"}
  //     />
  //   ),
  // },
];

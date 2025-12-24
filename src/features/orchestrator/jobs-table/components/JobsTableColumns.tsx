import { DTColumnHeader } from "@aventisia/ui/data-table";
import { ColumnDef } from "@tanstack/react-table";
import { format } from "date-fns";

import { TABLE_KEY } from "../constants";
import { getColumnName } from "../constants/column-display-names";
import { JobsTableDto } from "../dtos/jobs-table-dto";

import { JobRowActions } from "./jobs-row-actions/JobRowActions";

export const jobsTableColumns: ColumnDef<JobsTableDto>[] = [
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
    filterFn: (row, columnId, filterValue) => {
      const status = row.getValue(columnId);

      // If filterValue is a single string
      if (typeof filterValue === "string") {
        return status === filterValue;
      }

      // If filterValue is an array (for History tab)
      if (Array.isArray(filterValue)) {
        return filterValue.includes(status);
      }

      return true;
    },
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
        {row.getValue("startTime")
          ? format(row.getValue("startTime"), "dd MMM yyyy h:mm:ss a")
          : "NA"}
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
        {row.getValue("endTime")
          ? format(row.getValue("endTime"), "dd MMM yyyy h:mm:ss a")
          : "NA"}
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
        {row.getValue("duration") ? Math.round(row.getValue("duration")) : "NA"}
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
        {row.getValue("executedBy") ? row.getValue("executedBy") : "NA"}
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
        {row.getValue("executedOn")
          ? format(row.getValue("executedOn"), "dd MMM yyyy h:mm:ss a")
          : "NA"}
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
        {row.getValue("createdOn")
          ? format(row.getValue("createdOn"), "dd MMM yyyy h:mm:ss a")
          : "NA"}
      </div>
    ),
  },
  {
    id: "actions",
    cell: ({ row }) => (
      // Render the job row actions component
      <JobRowActions
        status={row.original.status}
        rowId={row.original?.id ?? "rowid"}
      />
    ),
  },
];

import { Badge } from "@aventisia/ui/badge";
import { DTColumnHeader } from "@aventisia/ui/data-table";
import { cn } from "@aventisia/ui/lib";
import { ColumnDef } from "@tanstack/react-table";
import { format } from "date-fns";

import { TABLE_KEY } from "../constants";
import { getColumnName, statusColor } from "../constants/column-display-names";
import { JobsTableDto } from "../dtos/jobs-table-dto";
import { formatSecondsToCompactDuration } from "../utils";
import { JobsTableCellLink } from "./JobsTableCellLink";
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
    cell: ({ row }) => {
      const isHistoryTab = !["Running", "Created"].includes(
        row.getValue("status"),
      );
      if (isHistoryTab)
        return (
          <div className="flex max-w-80 items-center gap-3 ">
            <JobsTableCellLink
              rowId={row.original.id ?? ""}
              versionId={row.original.flowVersionId ?? ""}
              cellValue={row.getValue("name")}
            />
            <p className="bg-muted border text-nowrap py-1 px-1.5  text-2xs leading-none  text-primary rounded-full">
              v{row.original.versionNumber ?? 0}
            </p>
          </div>
        );
      else
        return (
          <div className="w-auto truncate font-medium">
            {row.getValue("name")}
          </div>
        );
    },
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
      <Badge className={cn(statusColor[row.original.status])}>
        {row.getValue("status")}
      </Badge>
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
    id: "isPublished",
    accessorKey: "isPublished",
    header: ({ column }) => (
      <DTColumnHeader
        tableKey={TABLE_KEY}
        column={column}
        title={getColumnName("isPublished")}
      />
    ),
    cell: ({ row }) => (
      <div className="w-auto truncate font-medium">
        {row.getValue("isPublished") == true ? "Yes" : "No"}
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
    cell: ({ row }) => {
      const duration = row.getValue<number>("duration");

      return (
        <div className="w-auto truncate font-medium">
          {row.getValue("duration")
            ? formatSecondsToCompactDuration(duration)
            : "NA"}
        </div>
      );
    },
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

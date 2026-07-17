import { Checkbox } from "@aventisia/ui";
import { Badge } from "@aventisia/ui/badge";
import { FALLBACK_VALUE } from "@aventisia/ui/constants";
import { DTColumnHeader } from "@aventisia/ui/data-table";
import { cn } from "@aventisia/ui/lib";
import { ColumnDef } from "@tanstack/react-table";
import { format } from "date-fns";

import {
  JobRowActions,
  JobsTableCellLink,
  JobsTableRowDto,
  TABLE_KEY,
  formatSecondsToCompactDuration,
  getColumnName,
  statusColor,
} from "..";

export const jobsTableColumns: ColumnDef<JobsTableRowDto>[] = [
  {
    id: "id",
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
    accessorKey: "flowName",
    header: ({ column }) => (
      <DTColumnHeader
        tableKey={TABLE_KEY}
        column={column}
        title={getColumnName("flowName")}
      />
    ),
    cell: ({ row }) => (
      <div className="flex max-w-80 items-center gap-3">
        <JobsTableCellLink
          jobId={row.original.id}
          flowVersionId={row.original.flowVersionId}
          flowName={row.original.flowName}
          flowVersionNumber={row.original.flowVersionNumber}
        />
      </div>
    ),
  },
  {
    accessorKey: "flowVersionNumber",
    enableHiding: false,
    header: ({ column }) => (
      <DTColumnHeader
        tableKey={TABLE_KEY}
        column={column}
        title={getColumnName("flowVersionNumber") ?? 0}
      />
    ),
    cell: ({ row }) => (
      <div className="w-auto truncate font-medium">
        {row.getValue("flowVersionNumber") ?? FALLBACK_VALUE}
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
    accessorKey: "startTimeStamp",
    header: ({ column }) => (
      <DTColumnHeader
        tableKey={TABLE_KEY}
        className="w-[7rem]"
        column={column}
        title={getColumnName("startTimeStamp")}
      />
    ),
    cell: ({ row }) => (
      <div className="w-auto truncate font-medium">
        {row.getValue("startTimeStamp")
          ? format(
              new Date(row.getValue("startTimeStamp")),
              "dd MMM yyyy h:mm:ss a",
            )
          : FALLBACK_VALUE}
      </div>
    ),
  },
  {
    accessorKey: "endTimeStamp",
    header: ({ column }) => (
      <DTColumnHeader
        tableKey={TABLE_KEY}
        className="w-[7rem]"
        column={column}
        title={getColumnName("endTimeStamp")}
      />
    ),
    cell: ({ row }) => (
      <div className="w-auto truncate font-medium">
        {row.getValue("endTimeStamp")
          ? format(
              new Date(row.getValue("endTimeStamp")),
              "dd MMM yyyy h:mm:ss a",
            )
          : FALLBACK_VALUE}
      </div>
    ),
  },
  {
    accessorKey: "duration",
    header: ({ column }) => (
      <DTColumnHeader
        tableKey={TABLE_KEY}
        column={column}
        title={getColumnName("duration")}
      />
    ),
    cell: ({ row }) => {
      const duration = Number(row.getValue("duration"));
      return (
        <div className="w-auto truncate font-medium">
          {duration > 0
            ? formatSecondsToCompactDuration(duration)
            : FALLBACK_VALUE}
        </div>
      );
    },
  },
  {
    accessorKey: "creditsConsumed",
    header: ({ column }) => (
      <DTColumnHeader
        tableKey={TABLE_KEY}
        column={column}
        title={getColumnName("creditsConsumed") ?? 0}
      />
    ),
    cell: ({ row }) => (
      <div className="w-auto truncate font-medium">
        {row.getValue("creditsConsumed") ?? FALLBACK_VALUE}
      </div>
    ),
  },
  {
    accessorKey: "remarks",
    header: ({ column }) => (
      <DTColumnHeader
        tableKey={TABLE_KEY}
        column={column}
        title={getColumnName("remarks")}
      />
    ),
    cell: ({ row }) => (
      <div
        title={row.getValue("remarks") ?? ""}
        className="max-w-36 truncate font-medium"
      >
        {row.getValue("remarks") ?? FALLBACK_VALUE}
      </div>
    ),
  },
  {
    accessorKey: "triggerType",
    header: ({ column }) => (
      <DTColumnHeader
        tableKey={TABLE_KEY}
        column={column}
        title={getColumnName("triggerType")}
      />
    ),
    cell: ({ row }) => (
      <div className="w-auto truncate font-medium">
        {row.getValue("triggerType") ?? FALLBACK_VALUE}
      </div>
    ),
  },
  {
    accessorKey: "createdByName",
    header: ({ column }) => (
      <DTColumnHeader
        tableKey={TABLE_KEY}
        column={column}
        title={getColumnName("createdByName")}
      />
    ),
    cell: ({ row }) => (
      <div className="max-w-40 truncate font-medium">
        {row.getValue("createdByName") ?? FALLBACK_VALUE}
      </div>
    ),
  },
  {
    accessorKey: "createdAt",
    header: ({ column }) => (
      <DTColumnHeader
        tableKey={TABLE_KEY}
        className="w-[7rem]"
        column={column}
        title={getColumnName("createdAt")}
      />
    ),
    cell: ({ row }) => (
      <div className="w-auto truncate font-medium">
        {row.getValue("createdAt")
          ? format(new Date(row.getValue("createdAt")), "dd MMM yyyy h:mm:ss a")
          : FALLBACK_VALUE}
      </div>
    ),
  },

  {
    accessorKey: "executionLocation",
    header: ({ column }) => (
      <DTColumnHeader
        tableKey={TABLE_KEY}
        column={column}
        title={getColumnName("executionLocation")}
      />
    ),
    cell: ({ row }) => (
      <div className="max-w-40 truncate font-medium">
        {row.getValue("executionLocation") ?? FALLBACK_VALUE}
      </div>
    ),
  },
  {
    id: "isFlowVersionPublished",
    accessorKey: "isFlowVersionPublished",
    header: ({ column }) => (
      <DTColumnHeader
        tableKey={TABLE_KEY}
        column={column}
        title={getColumnName("isFlowVersionPublished")}
      />
    ),
    cell: ({ row }) => (
      <div className="w-auto truncate font-medium">
        {row.getValue("isFlowVersionPublished") === true ? "Yes" : "No"}
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
    accessorKey: "priority",
    header: ({ column }) => (
      <DTColumnHeader
        tableKey={TABLE_KEY}
        column={column}
        title={getColumnName("priority")}
      />
    ),
    cell: ({ row }) => (
      <div className="w-auto truncate font-medium">
        {row.getValue("priority") ?? FALLBACK_VALUE}
      </div>
    ),
  },
  {
    id: "actions",
    cell: ({ row }) => (
      // Render the job row actions component
      <JobRowActions status={row.original.status} rowId={row.original.id} />
    ),
  },
];

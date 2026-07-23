import { Checkbox, CopyableText } from "@avplatform/ui";
import { Badge } from "@avplatform/ui/badge";
import { FlowVersionNavLink } from "@avplatform/ui/components/FlowVersionNavLink";
import { FALLBACK_VALUE } from "@avplatform/ui/constants";
import { DTColumnHeader, createDTActionsColumn } from "@avplatform/ui/data-table";
import { cn } from "@avplatform/ui/lib";
import { ColumnDef } from "@tanstack/react-table";
import { format } from "date-fns";

import {
  JobRowActions,
  JobsTableRowDto,
  TABLE_KEY,
  formatSecondsToCompactDuration,
  getColumnName,
  statusColor,
} from "..";

export const jobsTableColumns: ColumnDef<JobsTableRowDto>[] = [
  {
    accessorKey: "selectRow",
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
    accessorKey: "flowName",
    header: ({ column }) => (
      <DTColumnHeader tableKey={TABLE_KEY} column={column} title={getColumnName("flowName")} />
    ),
    cell: ({ row }) => (
      <FlowVersionNavLink
        to={`${window.location.origin}${import.meta.env.VITE_STUDIO_PATH}execution-log?v=${row.original.flowVersionId}&j=${row.original.id}`}
        target="_blank"
        rel="noopener noreferrer"
        title={`View ${row.original.flowName} v${row.original.flowVersionNumber} in Agent Builder`}
        flowName={row.original.flowName ?? "NAME_NOT_FOUND"}
        flowVersionNumber={row.original.flowVersionNumber}
      />
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
      <DTColumnHeader tableKey={TABLE_KEY} column={column} title={getColumnName("status")} />
    ),
    cell: ({ row }) => (
      <Badge className={cn(statusColor[row.original.status])}>{row.getValue("status")}</Badge>
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
          ? format(new Date(row.getValue("startTimeStamp")), "dd MMM yyyy h:mm:ss a")
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
          ? format(new Date(row.getValue("endTimeStamp")), "dd MMM yyyy h:mm:ss a")
          : FALLBACK_VALUE}
      </div>
    ),
  },
  {
    accessorKey: "duration",
    header: ({ column }) => (
      <DTColumnHeader tableKey={TABLE_KEY} column={column} title={getColumnName("duration")} />
    ),
    cell: ({ row }) => {
      const duration = Number(row.getValue("duration"));
      return (
        <div className="w-auto truncate font-medium">
          {duration > 0 ? formatSecondsToCompactDuration(duration) : FALLBACK_VALUE}
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
      <DTColumnHeader tableKey={TABLE_KEY} column={column} title={getColumnName("remarks")} />
    ),
    cell: ({ row }) => (
      <div title={row.getValue("remarks") ?? ""} className="max-w-36 truncate font-medium">
        {row.getValue("remarks") ?? FALLBACK_VALUE}
      </div>
    ),
  },
  {
    accessorKey: "triggerType",
    header: ({ column }) => (
      <DTColumnHeader tableKey={TABLE_KEY} column={column} title={getColumnName("triggerType")} />
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
      <DTColumnHeader tableKey={TABLE_KEY} column={column} title={getColumnName("createdByName")} />
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
      <div className="w-auto truncate font-medium">{row.getValue("retryCount") ?? 0}</div>
    ),
  },
  {
    accessorKey: "priority",
    header: ({ column }) => (
      <DTColumnHeader tableKey={TABLE_KEY} column={column} title={getColumnName("priority")} />
    ),
    cell: ({ row }) => (
      <div className="w-auto truncate font-medium">
        {row.getValue("priority") ?? FALLBACK_VALUE}
      </div>
    ),
  },
  {
    accessorKey: "flowVersionId",
    header: ({ column }) => (
      <DTColumnHeader tableKey={TABLE_KEY} column={column} title={getColumnName("flowVersionId")} />
    ),
    cell: ({ row }) => (
      <CopyableText
        title={row.getValue("flowVersionId")}
        textClassName="w-auto max-w-32 truncate text-md font-mono"
        iconClassName="size-3"
        value={row.getValue("flowVersionId")}
      />
    ),
  },
  {
    accessorKey: "id",
    header: ({ column }) => (
      <DTColumnHeader tableKey={TABLE_KEY} column={column} title={getColumnName("id")} />
    ),
    cell: ({ row }) => (
      <CopyableText
        title={row.getValue("id")}
        textClassName="w-auto max-w-32 truncate text-md font-mono"
        iconClassName="size-3"
        value={row.getValue("id")}
      />
    ),
  },
  createDTActionsColumn<JobsTableRowDto>({
    renderCell: (row) => <JobRowActions status={row.status} rowId={row.id ?? "rowId"} />,
  }),
];

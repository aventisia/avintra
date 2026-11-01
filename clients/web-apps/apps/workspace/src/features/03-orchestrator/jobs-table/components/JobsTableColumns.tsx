import { CopyableText } from "@avplatform/ui";
import { Badge } from "@avplatform/ui/badge";
import { FALLBACK_VALUE } from "@avplatform/ui/constants";
import { DTOpenViewCell } from "@avplatform/ui/data-table";
import { TableCNColumnHeader, getTableCNSelectColumn } from "@avplatform/ui/table-cn";
import { ColumnDef, HeaderContext } from "@tanstack/react-table";
import { format } from "date-fns";

import { getRowActionsColumn } from "@/utils/get-row-actions-column.util";

import {
  JobRowActions,
  JobsTableRowDto,
  formatSecondsToCompactDuration,
  getColumnName,
  statusVariant,
} from "..";

const renderHeader =
  (columnKey: string) =>
  ({ column }: HeaderContext<JobsTableRowDto, unknown>) => (
    <TableCNColumnHeader column={column} label={getColumnName(columnKey)} />
  );

export const jobsTableColumns: ColumnDef<JobsTableRowDto>[] = [
  getTableCNSelectColumn<JobsTableRowDto>({
    enableHiding: true,
    meta: { label: getColumnName("select") },
  }),
  {
    id: "job",
    accessorKey: "id",
    meta: { label: getColumnName("job") },
    header: renderHeader("job"),
    cell: ({ row }) => (
      <DTOpenViewCell
        rowId={row.original.id}
        cellContent={`${row.original.flowName}_${row.original.flowVersionNumber}_${row.getValue("id") ?? "ID_NOT_FOUND"}`}
        entity="job"
      />
    ),
  },
  {
    accessorKey: "status",
    meta: { label: getColumnName("status") },
    header: renderHeader("status"),
    cell: ({ row }) => (
      <Badge variant={statusVariant[row.original.status]}>{row.getValue("status")}</Badge>
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
    meta: { label: getColumnName("startTimeStamp") },
    header: ({ column }) => (
      <TableCNColumnHeader
        className="w-[7rem]"
        column={column}
        label={getColumnName("startTimeStamp")}
      />
    ),
    cell: ({ row }) => (
      <div className="w-auto truncate font-mono tabular-nums">
        {row.getValue("startTimeStamp")
          ? format(new Date(row.getValue("startTimeStamp")), "dd MMM yyyy h:mm:ss a")
          : FALLBACK_VALUE}
      </div>
    ),
  },
  {
    accessorKey: "endTimeStamp",
    meta: { label: getColumnName("endTimeStamp") },
    header: ({ column }) => (
      <TableCNColumnHeader
        className="w-[7rem]"
        column={column}
        label={getColumnName("endTimeStamp")}
      />
    ),
    cell: ({ row }) => (
      <div className="w-auto truncate font-mono tabular-nums">
        {row.getValue("endTimeStamp")
          ? format(new Date(row.getValue("endTimeStamp")), "dd MMM yyyy h:mm:ss a")
          : FALLBACK_VALUE}
      </div>
    ),
  },
  {
    accessorKey: "duration",
    meta: { label: getColumnName("duration") },
    header: renderHeader("duration"),
    cell: ({ row }) => {
      const duration = Number(row.getValue("duration"));
      return (
        <div className="w-auto truncate font-mono tabular-nums">
          {duration > 0 ? formatSecondsToCompactDuration(duration) : FALLBACK_VALUE}
        </div>
      );
    },
  },
  {
    accessorKey: "creditsConsumed",
    meta: { label: getColumnName("creditsConsumed") },
    header: renderHeader("creditsConsumed"),
    cell: ({ row }) => {
      const value = row.getValue("creditsConsumed");
      return (
        <div className="w-auto truncate font-mono tabular-nums">
          {typeof value === "number"
            ? value.toLocaleString(undefined, { maximumFractionDigits: 2 })
            : FALLBACK_VALUE}
        </div>
      );
    },
  },
  {
    accessorKey: "remarks",
    meta: { label: getColumnName("remarks") },
    header: renderHeader("remarks"),
    cell: ({ row }) => (
      <div title={row.getValue("remarks") ?? ""} className="max-w-36 truncate font-medium">
        {row.getValue("remarks") ?? FALLBACK_VALUE}
      </div>
    ),
  },
  {
    accessorKey: "triggerType",
    meta: { label: getColumnName("triggerType") },
    header: renderHeader("triggerType"),
    cell: ({ row }) => (
      <div className="w-auto truncate font-medium">
        {row.getValue("triggerType") ?? FALLBACK_VALUE}
      </div>
    ),
  },
  {
    accessorKey: "createdByName",
    meta: { label: getColumnName("createdByName") },
    header: renderHeader("createdByName"),
    cell: ({ row }) => {
      const createdByName = row.getValue("createdByName") as string | undefined;
      // Backend format: "Full Name (email@domain.com)" - extract just the display name
      const displayName =
        createdByName && createdByName.includes(" (")
          ? createdByName.split(" (")[0].trim()
          : createdByName;
      return (
        <div title={createdByName ?? ""} className="max-w-40 truncate font-medium">
          {displayName ?? FALLBACK_VALUE}
        </div>
      );
    },
  },
  {
    accessorKey: "createdAt",
    meta: { label: getColumnName("createdAt") },
    header: ({ column }) => (
      <TableCNColumnHeader
        className="w-[7rem]"
        column={column}
        label={getColumnName("createdAt")}
      />
    ),
    cell: ({ row }) => (
      <div className="w-auto truncate font-mono tabular-nums">
        {row.getValue("createdAt")
          ? format(new Date(row.getValue("createdAt")), "dd MMM yyyy h:mm:ss a")
          : FALLBACK_VALUE}
      </div>
    ),
  },

  {
    accessorKey: "executionLocation",
    meta: { label: getColumnName("executionLocation") },
    header: renderHeader("executionLocation"),
    cell: ({ row }) => (
      <div
        title={row.getValue("executionLocation") ?? ""}
        className="max-w-40 truncate font-medium"
      >
        {row.getValue("executionLocation") ?? FALLBACK_VALUE}
      </div>
    ),
  },
  {
    id: "isFlowVersionPublished",
    accessorKey: "isFlowVersionPublished",
    meta: { label: getColumnName("isFlowVersionPublished") },
    header: renderHeader("isFlowVersionPublished"),
    cell: ({ row }) => (
      <div className="w-auto truncate font-medium">
        {row.getValue("isFlowVersionPublished") === true ? "Yes" : "No"}
      </div>
    ),
  },
  {
    accessorKey: "retryCount",
    meta: { label: getColumnName("retryCount") },
    header: renderHeader("retryCount"),
    cell: ({ row }) => (
      <div className="w-auto truncate font-mono tabular-nums">
        {row.getValue("retryCount") ?? 0}
      </div>
    ),
  },
  {
    accessorKey: "priority",
    meta: { label: getColumnName("priority") },
    header: renderHeader("priority"),
    cell: ({ row }) => (
      <div className="w-auto truncate font-medium">
        {row.getValue("priority") ?? FALLBACK_VALUE}
      </div>
    ),
  },
  {
    accessorKey: "flowVersionId",
    meta: { label: getColumnName("flowVersionId") },
    header: renderHeader("flowVersionId"),
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
    meta: { label: getColumnName("id") },
    header: renderHeader("id"),
    cell: ({ row }) => (
      <CopyableText
        title={row.getValue("id")}
        textClassName="w-auto max-w-32 truncate text-md font-mono"
        iconClassName="size-3"
        value={row.getValue("id")}
      />
    ),
  },
  getRowActionsColumn<JobsTableRowDto>({
    actions: ({ row }) => (
      <JobRowActions status={row.original.status} rowId={row.original.id ?? "rowId"} />
    ),
  }),
];

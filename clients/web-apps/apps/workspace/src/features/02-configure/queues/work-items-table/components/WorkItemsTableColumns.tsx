import { Badge } from "@avplatform/ui/badge";
import { TableCNColumnHeader } from "@avplatform/ui/table-cn";
import { formatDate } from "@avplatform/ui/utils";
import { ColumnDef, HeaderContext } from "@tanstack/react-table";
import { NavLink } from "react-router-dom";

import { getRowActionsColumn } from "@/utils/get-row-actions-column.util";

import { getColumnName, getStatusBadgeVariant } from "../constants/column-display-names";
import { QueueWorkItemDto } from "../dtos/queue-work-item-dto";
import { WorkItemRowActions } from "./WorkItemRowActions";

const renderHeader =
  (columnKey: string) =>
  ({ column }: HeaderContext<QueueWorkItemDto, unknown>) => (
    <TableCNColumnHeader column={column} label={getColumnName(columnKey)} />
  );

/**
 * Array of table columns for the WorkItems table.
 * Each column object contains an accessorKey, header component, and cell component.
 *
 * @param queueName Name of the parent queue, used for the detail-view link and
 * back navigation.
 */
export const workItemsTableColumns = (queueName = "WorkItem"): ColumnDef<QueueWorkItemDto>[] => [
  {
    accessorKey: "id",
    meta: { label: getColumnName("id") },
    header: renderHeader("id"),
    enableSorting: false,
    // Make the work item ID a link that opens the full work item detail
    // (JSON/form viewer and file viewer), matching the Assist experience.
    cell: ({ row }) => {
      const id = row.original.id ?? "";
      return (
        <NavLink
          to={`wid/${id}?name=${encodeURIComponent(queueName)}`}
          title="View work item"
          className="w-auto truncate font-mono tabular-nums text-foreground underline-offset-4 hover:text-primary-text hover:underline"
        >
          {id}
        </NavLink>
      );
    },
  },
  {
    accessorKey: "status",
    meta: { label: getColumnName("status") },
    header: renderHeader("status"),
    cell: ({ row }) => (
      <Badge variant={getStatusBadgeVariant(row.original.status)}>
        {row.original.status?.replace(/([A-Z])/g, " $1")}
      </Badge>
    ),
  },
  {
    accessorKey: "createdBy",
    meta: { label: getColumnName("createdBy") },
    header: renderHeader("createdBy"),
    cell: ({ row }) => (
      <div className="w-auto truncate font-medium">{row.getValue("createdBy")}</div>
    ),
  },
  {
    accessorKey: "createdOn",
    meta: { label: getColumnName("createdOn") },
    header: renderHeader("createdOn"),
    cell: ({ row }) => (
      <div className="w-auto truncate font-medium font-mono tabular-nums">
        {formatDate(row.getValue("createdOn"))}
      </div>
    ),
  },
  // Optional columns — hidden by default, users can toggle them on via the
  // table's View options (column visibility filter).
  {
    accessorKey: "sourceWorkItemId",
    meta: { label: getColumnName("sourceWorkItemId") },
    header: renderHeader("sourceWorkItemId"),
    cell: ({ row }) => {
      const sourceWorkItemId = row.original.sourceWorkItemId;
      // Unrouted items carry Guid.Empty (all zeros) — treat as no source item.
      const isEmptyGuid = !sourceWorkItemId || sourceWorkItemId.startsWith("00000000-");
      return (
        <div className="w-auto truncate font-mono tabular-nums">
          {isEmptyGuid ? "--" : sourceWorkItemId}
        </div>
      );
    },
    enableSorting: false,
  },
  {
    accessorKey: "retryTime",
    meta: { label: getColumnName("retryTime") },
    header: renderHeader("retryTime"),
    cell: ({ row }) => {
      const retryTime = row.original.retryTime;
      return (
        <div className="w-auto truncate font-medium font-mono tabular-nums">
          {retryTime ? formatDate(retryTime as string, true) : "--"}
        </div>
      );
    },
  },
  {
    accessorKey: "retryCount",
    meta: { label: getColumnName("retryCount") },
    header: renderHeader("retryCount"),
    cell: ({ row }) => (
      <div className="w-auto truncate font-medium font-mono tabular-nums">
        {row.original.retryCount ?? 0}
      </div>
    ),
  },
  getRowActionsColumn<QueueWorkItemDto>({
    actions: ({ row }) => <WorkItemRowActions rowId={row.original.id ?? "rowId"} />,
  }),
];

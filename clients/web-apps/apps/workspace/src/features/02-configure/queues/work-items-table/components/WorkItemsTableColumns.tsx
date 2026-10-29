import { Badge } from "@avplatform/ui/badge";
import { DTColumnHeader, createDTActionsColumn } from "@avplatform/ui/data-table";
import { formatDate } from "@avplatform/ui/utils";
import { ColumnDef } from "@tanstack/react-table";
import { NavLink } from "react-router-dom";

import { TABLE_KEY } from "../constants";
import { getStatusBadgeVariant } from "../constants/column-display-names";
import { QueueWorkItemDto } from "../dtos/queue-work-item-dto";
import { WorkItemRowActions } from "./WorkItemRowActions";

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
    header: ({ column }) => <DTColumnHeader tableKey={TABLE_KEY} column={column} title={"Id"} />,
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
    header: ({ column }) => (
      <DTColumnHeader tableKey={TABLE_KEY} column={column} title={"Status"} />
    ),
    cell: ({ row }) => (
      <Badge variant={getStatusBadgeVariant(row.original.status)}>
        {row.original.status?.replace(/([A-Z])/g, " $1")}
      </Badge>
    ),
  },
  {
    accessorKey: "createdBy",
    header: ({ column }) => (
      <DTColumnHeader tableKey={TABLE_KEY} column={column} title={"Created by"} />
    ),
    cell: ({ row }) => (
      <div className="w-auto truncate font-medium">{row.getValue("createdBy")}</div>
    ),
  },
  {
    accessorKey: "createdOn",
    header: ({ column }) => (
      <DTColumnHeader tableKey={TABLE_KEY} column={column} title={"Created on"} />
    ),
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
    header: ({ column }) => (
      <DTColumnHeader tableKey={TABLE_KEY} column={column} title={"Source work item ID"} />
    ),
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
    header: ({ column }) => (
      <DTColumnHeader tableKey={TABLE_KEY} column={column} title={"Retry time"} />
    ),
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
    header: ({ column }) => (
      <DTColumnHeader tableKey={TABLE_KEY} column={column} title={"Retry count"} />
    ),
    cell: ({ row }) => (
      <div className="w-auto truncate font-medium font-mono tabular-nums">
        {row.original.retryCount ?? 0}
      </div>
    ),
  },
  createDTActionsColumn<QueueWorkItemDto>({
    renderCell: (row) => <WorkItemRowActions rowId={row.id ?? "rowId"} />,
  }),
];

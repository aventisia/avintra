import { Badge } from "@avplatform/ui/badge";
import { FALLBACK_VALUE } from "@avplatform/ui/constants";
import { TableCNColumnHeader, getTableCNSelectColumn } from "@avplatform/ui/table-cn";
import { formatDate } from "@avplatform/ui/utils";
import { ColumnDef, HeaderContext } from "@tanstack/react-table";
import { NavLink } from "react-router-dom";

import { getRowActionsColumn } from "@/utils/get-row-actions-column.util";

import { InputSchemaField } from "../../queues-table/dtos/queues-table-dto";
import { getColumnName, getStatusBadgeVariant } from "../constants/column-display-names";
import {
  WorkItemsTableRow,
  customColumnId,
  customFieldLabel,
} from "../utils/work-items-custom-columns.util";
import { WorkItemRowActions } from "./WorkItemRowActions";

const renderHeader =
  (columnKey: string) =>
  ({ column }: HeaderContext<WorkItemsTableRow, unknown>) => (
    <TableCNColumnHeader column={column} label={getColumnName(columnKey)} />
  );

const formatCustomFieldValue = (value: unknown): string => {
  if (value === null || value === undefined || value === "") return FALLBACK_VALUE;
  return typeof value === "object" ? JSON.stringify(value) : String(value);
};

const customFieldColumns = (fields: InputSchemaField[]): ColumnDef<WorkItemsTableRow>[] =>
  fields.map((field) => ({
    id: customColumnId(field),
    accessorFn: (row) => row.customData?.[field.name],
    meta: { label: customFieldLabel(field) },
    header: ({ column }) => (
      <TableCNColumnHeader column={column} label={customFieldLabel(field)} className="max-w-40" />
    ),
    cell: ({ getValue }) => {
      const value = formatCustomFieldValue(getValue());
      return (
        <div title={value} className="w-40 truncate font-medium">
          {value}
        </div>
      );
    },
  }));

/**
 * Array of table columns for the WorkItems table.
 *
 * @param queueName Name of the parent queue, used for the detail-view link and
 * back navigation.
 * @param customFields The queue's non-array custom fields, rendered after Status.
 */
export const workItemsTableColumns = (
  queueName = "WorkItem",
  customFields: InputSchemaField[] = [],
): ColumnDef<WorkItemsTableRow>[] => [
  getTableCNSelectColumn<WorkItemsTableRow>({
    enableHiding: true,
    meta: { label: getColumnName("select") },
  }),
  {
    id: "workItemId",
    accessorKey: "id",
    meta: { label: getColumnName("workItemId") },
    header: renderHeader("workItemId"),
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
  ...customFieldColumns(customFields),
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
  getRowActionsColumn<WorkItemsTableRow>({
    actions: ({ row }) => <WorkItemRowActions rowId={row.original.id ?? "rowId"} />,
  }),
];

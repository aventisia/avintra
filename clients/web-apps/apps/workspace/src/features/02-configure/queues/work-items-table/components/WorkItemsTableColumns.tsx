import { Checkbox } from "@avplatform/ui";
import { Badge } from "@avplatform/ui/badge";
import { FALLBACK_VALUE } from "@avplatform/ui/constants";
import { DTColumnHeader, createDTActionsColumn } from "@avplatform/ui/data-table";
import { formatDate } from "@avplatform/ui/utils";
import { ColumnDef } from "@tanstack/react-table";
import { NavLink } from "react-router-dom";

import { InputSchemaField } from "../../queues-table/dtos/queues-table-dto";
import { getStatusBadgeVariant } from "../constants/column-display-names";
import {
  WorkItemsTableRow,
  customColumnId,
  customFieldLabel,
} from "../utils/work-items-custom-columns.util";
import { WorkItemRowActions } from "./WorkItemRowActions";

const formatCustomFieldValue = (value: unknown): string => {
  if (value === null || value === undefined || value === "") return FALLBACK_VALUE;
  return typeof value === "object" ? JSON.stringify(value) : String(value);
};

const customFieldColumns = (
  fields: InputSchemaField[],
  tableKey: string,
): ColumnDef<WorkItemsTableRow>[] =>
  fields.map((field) => ({
    id: customColumnId(field),
    accessorFn: (row) => row.customData?.[field.name],
    header: ({ column }) => (
      <DTColumnHeader
        tableKey={tableKey}
        column={column}
        title={customFieldLabel(field)}
        className="max-w-40"
      />
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
 * @param tableKey Key holding this queue's saved column visibility and sort state.
 */
export const workItemsTableColumns = (
  queueName = "WorkItem",
  customFields: InputSchemaField[] = [],
  tableKey: string,
): ColumnDef<WorkItemsTableRow>[] => [
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
    id: "workItemId",
    accessorKey: "id",
    header: ({ column }) => (
      <DTColumnHeader tableKey={tableKey} column={column} title={"Work Item Id"} />
    ),
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
    header: ({ column }) => <DTColumnHeader tableKey={tableKey} column={column} title={"Status"} />,
    cell: ({ row }) => (
      <Badge variant={getStatusBadgeVariant(row.original.status)}>
        {row.original.status?.replace(/([A-Z])/g, " $1")}
      </Badge>
    ),
  },
  ...customFieldColumns(customFields, tableKey),
  {
    accessorKey: "createdBy",
    header: ({ column }) => (
      <DTColumnHeader tableKey={tableKey} column={column} title={"Created By"} />
    ),
    cell: ({ row }) => (
      <div className="w-auto truncate font-medium">{row.getValue("createdBy")}</div>
    ),
  },
  {
    accessorKey: "createdOn",
    header: ({ column }) => (
      <DTColumnHeader tableKey={tableKey} column={column} title={"Created On"} />
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
      <DTColumnHeader tableKey={tableKey} column={column} title={"Source Work Item Id"} />
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
      <DTColumnHeader tableKey={tableKey} column={column} title={"Retry Time"} />
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
      <DTColumnHeader tableKey={tableKey} column={column} title={"Retry Count"} />
    ),
    cell: ({ row }) => (
      <div className="w-auto truncate font-medium font-mono tabular-nums">
        {row.original.retryCount ?? 0}
      </div>
    ),
  },
  createDTActionsColumn<WorkItemsTableRow>({
    renderCell: (row) => <WorkItemRowActions rowId={row.id ?? "rowId"} />,
  }),
];

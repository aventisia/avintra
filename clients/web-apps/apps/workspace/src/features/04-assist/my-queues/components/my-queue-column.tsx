import { Badge } from "@avplatform/ui/badge";
import { FALLBACK_VALUE } from "@avplatform/ui/constants";
import { TableCNColumnHeader } from "@avplatform/ui/table-cn";
import { Column, ColumnDef } from "@tanstack/react-table";

import { getRowActionsColumn } from "@/utils/get-row-actions-column.util";

import { getStatusBadgeVariant } from "../constants";
import { InputSchemaField } from "../dtos/queues-table-dto";
import { WorkItemRow } from "../types/my-queue-types";
import { WorkItemsTableCellLink } from "./work-item-table/WorkItemsTableCellLink";
import { WorkItemActions } from "./work-item-table/work-item-row-actions/WorkItemRowActions";

/**
 * Safely converts a dynamic cell value to a readable string for display.
 * Primitives (string/number/boolean) are rendered as-is; objects and arrays are
 * serialized to JSON so nested content shows its actual value instead of
 * "[object Object]". Null/undefined render as the fallback value.
 */
const formatDynamicCell = (value: unknown, fallback: string): string => {
  if (value === null || value === undefined) return fallback;
  if (typeof value === "string") return value === "" ? fallback : value;
  if (typeof value === "number" || typeof value === "boolean" || typeof value === "bigint") {
    return String(value);
  }
  // Objects and arrays -> readable JSON.
  try {
    return JSON.stringify(value);
  } catch {
    return String(value);
  }
};

export const generateDTColumns = (fields: InputSchemaField[]): ColumnDef<WorkItemRow>[] =>
  fields.map((field) => ({
    accessorKey: field.name,
    meta: { label: field.name.charAt(0).toUpperCase() + field.name.slice(1) },
    header: ({ column }) => (
      <TableCNColumnHeader
        column={column}
        label={field.name.charAt(0).toUpperCase() + field.name.slice(1)}
        className="max-w-40"
      />
    ),
    cell: (info) => {
      const value = formatDynamicCell(info.getValue(), FALLBACK_VALUE);
      return (
        <div title={value} className="w-40 truncate font-medium">
          {value}
        </div>
      );
    },
  }));

export const buildColumns = (
  inputSchema: InputSchemaField[],
  isFifo = false,
  tabValue?: string,
  viewOnly = false,
): ColumnDef<WorkItemRow>[] => {
  const isHistory = tabValue === "History";

  return [
    {
      accessorKey: "rowId",
      meta: { label: "WorkItem" },
      header: ({ column }) => <TableCNColumnHeader column={column} label="WorkItem" />,
      cell: ({ row }) => (
        <WorkItemsTableCellLink rowId={row.original.rowId}>
          {row.original.rowId}
        </WorkItemsTableCellLink>
      ),
      enableSorting: false,
    },
    ...generateDTColumns(inputSchema),
    {
      accessorKey: "assignee",
      meta: { label: "Assignee" },
      header: ({ column }) => <TableCNColumnHeader column={column} label="Assignee" />,
      cell: ({ row }) => {
        const value = row.original.assignee ?? FALLBACK_VALUE;
        return (
          <div title={value} className="w-32 truncate font-medium">
            {value}
          </div>
        );
      },
    },
    {
      accessorKey: "createdOn",
      meta: { label: "Created on" },
      header: ({ column }) => <TableCNColumnHeader column={column} label="Created on" />,
      cell: ({ row }) => {
        const value = row.original.createdOn;
        if (!value) return <div className="text-muted-foreground">{FALLBACK_VALUE}</div>;
        const formatted = new Date(value).toLocaleString();
        return (
          <span
            className="inline-block w-40 truncate font-mono font-medium tabular-nums"
            title={formatted}
          >
            {formatted}
          </span>
        );
      },
    },
    // History-only: when the work item was closed.
    ...(isHistory
      ? [
          {
            accessorKey: "closedOn",
            meta: { label: "Closed on" },
            header: ({ column }: { column: Column<WorkItemRow, unknown> }) => (
              <TableCNColumnHeader column={column} label="Closed on" />
            ),
            cell: ({ row }: { row: { original: WorkItemRow } }) => {
              const value = row.original.closedOn;
              if (!value) return <div className="text-muted-foreground">{FALLBACK_VALUE}</div>;
              const formatted = new Date(value).toLocaleString();
              return (
                <span
                  className="inline-block w-40 truncate font-mono font-medium tabular-nums"
                  title={formatted}
                >
                  {formatted}
                </span>
              );
            },
          },
        ]
      : []),
    {
      accessorKey: "status",
      meta: { label: isHistory ? "Disposition Status" : "Status" },
      header: ({ column }) => (
        <TableCNColumnHeader column={column} label={isHistory ? "Disposition Status" : "Status"} />
      ),
      cell: ({ row }) => (
        <Badge variant={getStatusBadgeVariant(row.original.status)}>
          {row.original.status?.replace(/([A-Z])/g, " $1")}
        </Badge>
      ),
    },
    // Actions column (Open/route etc.) is omitted entirely for view-only queues.
    ...(viewOnly
      ? []
      : [
          getRowActionsColumn<WorkItemRow>({
            actions: ({ row }) => (
              <WorkItemActions
                rowId={row.original.rowId}
                status={row.original.status ?? ""}
                isFifo={isFifo}
              />
            ),
          }),
        ]),
  ];
};

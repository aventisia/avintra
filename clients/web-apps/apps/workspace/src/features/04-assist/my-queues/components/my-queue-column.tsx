import { Badge } from "@avplatform/ui/badge";
import { FALLBACK_VALUE } from "@avplatform/ui/constants";
import { DTColumnHeader } from "@avplatform/ui/data-table";
import { KeyValueLookupType } from "@avplatform/ui/types";
import { ColumnDef } from "@tanstack/react-table";

import { TABLE_KEY, getStatusColor } from "../constants";
import { InputSchemaField } from "../dtos/queues-table-dto";
import { WorkItemRow } from "../types/my-queue-types";
import { WorkItemsTableCellLink } from "./work-item-table/WorkItemsTableCellLink";
import { WorkItemActions } from "./work-item-table/work-item-row-actions/WorkItemRowActions";

export const generateDTColumns = (fields: InputSchemaField[]): ColumnDef<WorkItemRow>[] =>
  fields.map((field) => ({
    accessorKey: field.name,

    header: ({ column }) => (
      <DTColumnHeader
        tableKey={TABLE_KEY}
        column={column}
        title={field.name.charAt(0).toUpperCase() + field.name.slice(1)}
        className="max-w-40"
      />
    ),
    cell: (info) => (
      <div className="w-40 truncate font-medium">{String(info.getValue() ?? FALLBACK_VALUE)}</div>
    ),
  }));

export const generateColumnsDisplayName = (fields: InputSchemaField[]): KeyValueLookupType[] =>
  fields.map((field) => ({
    key: field.name,
    value: field.name.charAt(0).toUpperCase() + field.name.slice(1),
  }));

export const buildColumns = (
  inputSchema: InputSchemaField[],
  isFifo = false,
  tabValue?: string,
): ColumnDef<WorkItemRow>[] => {
  const isHistory = tabValue === "History";

  return [
    {
      accessorKey: "rowId",
      header: ({ column }) => (
        <DTColumnHeader tableKey={TABLE_KEY} column={column} title="WorkItem" />
      ),
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
      header: ({ column }) => (
        <DTColumnHeader tableKey={TABLE_KEY} column={column} title="Assignee" />
      ),
      cell: ({ row }) => (
        <div className="w-32 truncate font-medium">
          {row.original.assignee ?? FALLBACK_VALUE}
        </div>
      ),
    },
    {
      accessorKey: "createdOn",
      header: ({ column }) => (
        <DTColumnHeader tableKey={TABLE_KEY} column={column} title="Created On" />
      ),
      cell: ({ row }) => {
        const value = row.original.createdOn;
        if (!value) return <div className="text-muted-foreground">{FALLBACK_VALUE}</div>;
        return (
          <div className="w-40 truncate font-medium">
            {new Date(value).toLocaleString()}
          </div>
        );
      },
    },
    // History-only: when the work item was closed.
    ...(isHistory
      ? [
          {
            accessorKey: "closedOn",
            header: ({ column }: { column: { id: string } }) => (
              <DTColumnHeader tableKey={TABLE_KEY} column={column} title="Closed On" />
            ),
            cell: ({ row }: { row: { original: WorkItemRow } }) => {
              const value = row.original.closedOn;
              if (!value) return <div className="text-muted-foreground">{FALLBACK_VALUE}</div>;
              return (
                <div className="w-40 truncate font-medium">
                  {new Date(value).toLocaleString()}
                </div>
              );
            },
          },
        ]
      : []),
    {
      accessorKey: "status",
      header: ({ column }) => (
        <DTColumnHeader
          tableKey={TABLE_KEY}
          column={column}
          title={isHistory ? "Disposition Status" : "Status"}
        />
      ),
      cell: ({ row }) => (
        <Badge className={getStatusColor(row.original.status)}>
          {row.original.status?.replace(/([A-Z])/g, " $1")}
        </Badge>
      ),
    },
    {
      id: "actions",
      cell: ({ row }) => (
        <WorkItemActions
          rowId={row.original.rowId}
          status={row.original.status ?? ""}
          isFifo={isFifo}
        />
      ),
    },
  ];
};

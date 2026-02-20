import { Badge } from "@aventisia/ui/badge";
import { DTColumnHeader } from "@aventisia/ui/data-table";
import { ColumnDef } from "@tanstack/react-table";

import { statusColor, TABLE_KEY } from "../constants";
import { InputSchemaField } from "../dtos/queues-table-dto";
import { WorkItemRow } from "../types/my-queue-types";

import { WorkItemActions } from "./workitem-row-actions/WorkItemRowActions";
import { WorkItemsTableCellLink } from "./WorkItemsTableCellLink";

export const generateDTColumns = (
  fields: InputSchemaField[],
): ColumnDef<WorkItemRow>[] =>
  fields.map((field) => ({
    accessorKey: field.name,
    header: ({ column }) => (
      <DTColumnHeader
        tableKey={TABLE_KEY}
        column={column}
        title={field.name.charAt(0).toUpperCase() + field.name.slice(1)}
      />
    ),
    cell: (info) => (
      <div className="truncate font-medium">
        {String(info.getValue() ?? "-")}
      </div>
    ),
  }));

export const buildColumns = (
  inputSchema: InputSchemaField[],
): ColumnDef<WorkItemRow>[] => [
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
    accessorKey: "status",
    header: ({ column }) => (
      <DTColumnHeader tableKey={TABLE_KEY} column={column} title="Status" />
    ),
    cell: ({ row }) => (
      <Badge
        className={
          row.original.status
            ? statusColor[row.original.status]
            : "bg-slate-200 text-slate-600"
        }
      >
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
      />
    ),
  },
];

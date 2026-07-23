import { Badge } from "@avplatform/ui/badge";
import { FALLBACK_VALUE } from "@avplatform/ui/constants";
import { DTColumnHeader } from "@avplatform/ui/data-table";
import { KeyValueLookupType } from "@avplatform/ui/types";
import { ColumnDef } from "@tanstack/react-table";

import { TABLE_KEY, statusColor } from "../constants";
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

export const buildColumns = (inputSchema: InputSchemaField[]): ColumnDef<WorkItemRow>[] => [
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
    header: ({ column }) => <DTColumnHeader tableKey={TABLE_KEY} column={column} title="Status" />,
    cell: ({ row }) => (
      <Badge
        className={
          row.original.status ? statusColor[row.original.status] : "bg-slate-200 text-slate-600"
        }
      >
        {row.original.status?.replace(/([A-Z])/g, " $1")}
      </Badge>
    ),
  },
  {
    id: "actions",
    cell: ({ row }) => (
      <WorkItemActions rowId={row.original.rowId} status={row.original.status ?? ""} />
    ),
  },
];

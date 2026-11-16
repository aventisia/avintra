import { TableCNColumnHeader } from "@avplatform/ui/table-cn";
import { formatDate } from "@avplatform/ui/utils";
import { ColumnDef } from "@tanstack/react-table";

import { getColumnName } from "../constants/column-display-names";
import { KnowledgeBaseTableDto } from "../dtos/knowledge-base-table-dto";

/**
 * Array of table columns for the configs table.
 * Each column object contains an accessorKey, header component, and cell component.
 */
export const KBTableColumns = (): ColumnDef<KnowledgeBaseTableDto>[] => [
  {
    accessorKey: "name",
    meta: { label: getColumnName("name") },
    header: ({ column }) => <TableCNColumnHeader column={column} label={getColumnName("name")} />,
    cell: ({ row }) => (
      <div className="flex max-w-80 items-center gap-3 ">
        <div className="w-auto truncate font-medium">{row.getValue("name")}</div>
        <p className="bg-muted border text-nowrap p-1  text-2xs leading-none  text-ink-2 rounded-sm">
          {row.original.accessLevel?.replace(/([A-Z])/g, " $1")}
        </p>
      </div>
    ),
  },
  {
    accessorKey: "description",
    meta: { label: getColumnName("description") },
    header: ({ column }) => (
      <TableCNColumnHeader column={column} label={getColumnName("description")} />
    ),
    cell: ({ row }) => (
      <div className="w-auto truncate font-medium">{row.getValue("description")}</div>
    ),
  },
  {
    accessorKey: "createdBy",
    meta: { label: getColumnName("createdBy") },
    header: ({ column }) => (
      <TableCNColumnHeader column={column} label={getColumnName("createdBy")} />
    ),
    cell: ({ row }) => (
      <div className="w-auto truncate font-medium">{row.getValue("createdBy")}</div>
    ),
  },
  {
    accessorKey: "createdOn",
    meta: { label: getColumnName("createdOn") },
    header: ({ column }) => (
      <TableCNColumnHeader
        className="w-[7rem]"
        column={column}
        label={getColumnName("createdOn")}
      />
    ),
    cell: ({ row }) => (
      <div className="w-auto truncate font-medium font-mono tabular-nums">
        {formatDate(row.getValue("createdOn"))}
      </div>
    ),
  },
  {
    accessorKey: "totalChunks",
    meta: { label: getColumnName("totalChunks") },
    header: ({ column }) => (
      <TableCNColumnHeader column={column} label={getColumnName("totalChunks")} />
    ),
    cell: ({ row }) => (
      <div className="w-auto truncate font-medium">{row.getValue("totalChunks") ?? 0}</div>
    ),
  },
];

import { Checkbox } from "@avplatform/ui";
import { DTColumnHeader } from "@avplatform/ui/data-table";
import { formatDate } from "@avplatform/ui/utils";
import { ColumnDef } from "@tanstack/react-table";

import { TABLE_KEY } from "../constants";
import { getColumnName } from "../constants/column-display-names";
import { KnowledgeBaseTableDto } from "../dtos/knowledge-base-table-dto";
import { KBRowActions } from "./kb-row-actions/KBRowActions";

/**
 * Array of table columns for the configs table.
 * Each column object contains an accessorKey, header component, and cell component.
 */
export const KBTableColumns = (isSharedTab: boolean): ColumnDef<KnowledgeBaseTableDto>[] => [
  {
    accessorKey: "id",
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
    accessorKey: "name",
    header: ({ column }) => (
      <DTColumnHeader tableKey={TABLE_KEY} column={column} title={getColumnName("name")} />
    ),
    cell: ({ row }) => (
      <div className="flex max-w-80 items-center gap-3 ">
        <div className="w-auto truncate font-medium">{row.getValue("name")}</div>
        {isSharedTab && (
          <p className="bg-muted border text-nowrap p-1  text-2xs leading-none  text-primary rounded-full">
            {row.original.accessLevel?.replace(/([A-Z])/g, " $1")}
          </p>
        )}
      </div>
    ),
  },
  {
    accessorKey: "description",
    header: ({ column }) => (
      <DTColumnHeader tableKey={TABLE_KEY} column={column} title={getColumnName("description")} />
    ),
    cell: ({ row }) => (
      <div className="w-auto truncate font-medium">{row.getValue("description")}</div>
    ),
  },
  {
    accessorKey: "createdBy",
    header: ({ column }) => (
      <DTColumnHeader tableKey={TABLE_KEY} column={column} title={getColumnName("createdBy")} />
    ),
    cell: ({ row }) => (
      <div className="w-auto truncate font-medium">{row.getValue("createdBy")}</div>
    ),
  },
  {
    accessorKey: "createdOn",
    header: ({ column }) => (
      <DTColumnHeader
        tableKey={TABLE_KEY}
        className="w-[7rem]"
        column={column}
        title={getColumnName("createdOn")}
      />
    ),
    cell: ({ row }) => (
      <div className="w-auto truncate font-medium">{formatDate(row.getValue("createdOn"))}</div>
    ),
  },
  {
    accessorKey: "totalChunks",
    header: ({ column }) => (
      <DTColumnHeader tableKey={TABLE_KEY} column={column} title={getColumnName("totalChunks")} />
    ),
    cell: ({ row }) => (
      <div className="w-auto truncate font-medium">{row.getValue("totalChunks") ?? 0}</div>
    ),
  },
  {
    id: "actions",
    cell: ({ row }) => (
      // Render the configs row actions component
      <KBRowActions
        rowId={row.original.id || "rowId"}
        name={row.original.name}
        accessLevel={row.original.accessLevel}
        isTenantWideAccess={row.original.isTenantWideAccess || false}
      />
    ),
  },
];

import { Checkbox } from "@aventisia/ui";
import { DTColumnHeader } from "@aventisia/ui/data-table";
import { dateFormatter } from "@aventisia/ui/utils";
import { ColumnDef } from "@tanstack/react-table";

import { DETAIL_TABLE_KEY } from "../../constants";
import { KnowledgeBaseFileDto } from "../../dtos/kb-file-dto";
import { KBFilesTableRowAction } from "./KBFilesTableRowAction";

/**
 * Array of table columns for the KBFilesTable.
 * Each column object contains an accessorKey, header component, and cell component.
 */
export const KBFilesTableColumns: ColumnDef<KnowledgeBaseFileDto>[] = [
  {
    accessorKey: "id",
    size: 24,
    maxSize: 24,
    enableResizing: false,
    header: ({ table }) => (
      <Checkbox
        checked={
          table.getIsAllPageRowsSelected() ||
          (table.getIsSomePageRowsSelected() && "indeterminate")
        }
        onCheckedChange={(value) => table.toggleAllPageRowsSelected(!!value)}
        aria-label="Select all"
        className="translate-y-[2px] "
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
      <DTColumnHeader
        tableKey={DETAIL_TABLE_KEY}
        column={column}
        title={"File Name"}
      />
    ),
    cell: ({ row }) => (
      <div className="w-auto truncate font-medium">{row.original.fileName}</div>
    ),
  },
  {
    accessorKey: "category",
    header: ({ column }) => (
      <DTColumnHeader
        tableKey={DETAIL_TABLE_KEY}
        column={column}
        title={"Category"}
      />
    ),
    cell: ({ row }) => (
      <div className="w-auto truncate font-medium">
        {row.original?.category}
      </div>
    ),
  },
  {
    accessorKey: "createdBy",
    header: ({ column }) => (
      <DTColumnHeader
        tableKey={DETAIL_TABLE_KEY}
        column={column}
        title={"Created By"}
        className="max-w-16"
      />
    ),
    cell: ({ row }) => (
      <div className="">
        <div className="w-auto truncate font-medium">
          {row.getValue("createdBy")}
        </div>
        <div className="w-auto text-muted-foreground  text-xs font-medium">
          {dateFormatter(row.original.createdOn)}
        </div>
      </div>
    ),
  },

  {
    id: "actions",
    size: 24,
    maxSize: 24,
    enableResizing: false,
    cell: ({ row }) => (
      // Render the queues row actions component
      <KBFilesTableRowAction rowId={row.original.id ?? "rowId"} />
    ),
  },
];

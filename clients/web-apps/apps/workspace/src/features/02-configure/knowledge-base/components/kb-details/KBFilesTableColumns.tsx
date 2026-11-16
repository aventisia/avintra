import { Badge } from "@avplatform/ui/badge";
import { TableCNColumnHeader } from "@avplatform/ui/table-cn";
import { formatDate } from "@avplatform/ui/utils";
import { ColumnDef, HeaderContext } from "@tanstack/react-table";

import { getRowActionsColumn } from "@/utils/get-row-actions-column.util";

import { KnowledgeBaseFileDto, VectorizationStatus } from "../../dtos/kb-file-dto";
import { KnowledgeBaseTableDto } from "../../dtos/knowledge-base-table-dto";
import { FileNameCell } from "./FileNameCell";
import { KBFilesTableRowAction } from "./KBFilesTableRowAction";

const statusVariantMap: Record<
  VectorizationStatus,
  "default" | "secondary" | "destructive" | "outline"
> = {
  Pending: "outline",
  Processing: "secondary",
  Completed: "default",
  Failed: "destructive",
};

/**
 * Array of table columns for the KBFilesTable.
 * Each column object contains an accessorKey, header component, and cell component.
 */
export const getKBFilesTableColumns = (
  knowledgeBaseId: string,
  knowledgeBase?: KnowledgeBaseTableDto,
): ColumnDef<KnowledgeBaseFileDto>[] => [
  {
    accessorKey: "fileName",
    meta: { label: "File/document name" },
    enableHiding: false,
    header: ({ column }: HeaderContext<KnowledgeBaseFileDto, unknown>) => (
      <TableCNColumnHeader column={column} label="File/document name" />
    ),
    cell: ({ row }) => <FileNameCell fileName={row.original.fileName} />,
  },
  {
    accessorKey: "chunksCount",
    meta: { label: "Chunks" },
    header: ({ column }) => (
      <TableCNColumnHeader className="max-w-16" column={column} label="Chunks" />
    ),
    cell: ({ row }) => (
      <div className="w-16 font-medium font-mono tabular-nums">
        {row.original.chunksCount || "—"}
      </div>
    ),
  },
  {
    accessorKey: "status",
    meta: { label: "Status" },
    header: ({ column }) => (
      <TableCNColumnHeader className="max-w-20" column={column} label="Status" />
    ),
    cell: ({ row }) => {
      const status = row.original.status;
      return <Badge variant={statusVariantMap[status] ?? "outline"}>{status}</Badge>;
    },
  },
  {
    accessorKey: "createdBy",
    meta: { label: "Created by" },
    enableHiding: false,
    header: ({ column }) => (
      <TableCNColumnHeader className="max-w-16" column={column} label="Created by" />
    ),
    cell: ({ row }) => (
      <div title={row.getValue("createdBy")} className="w-28 truncate font-medium">
        {row.getValue("createdBy")}
      </div>
    ),
  },
  {
    accessorKey: "createdOn",
    meta: { label: "Created on" },
    enableHiding: false,
    header: ({ column }) => (
      <TableCNColumnHeader className="max-w-16" column={column} label="Created on" />
    ),
    cell: ({ row }) => (
      <div className="w-24 font-medium font-mono tabular-nums">
        {formatDate(row.original.createdOn)}
      </div>
    ),
  },
  getRowActionsColumn<KnowledgeBaseFileDto>({
    size: 48,
    minSize: 48,
    maxSize: 48,
    enableResizing: false,
    actions: ({ row }) => (
      <KBFilesTableRowAction
        row={row.original}
        knowledgeBaseId={knowledgeBaseId}
        knowledgeBase={knowledgeBase}
      />
    ),
  }),
];

import { Badge } from "@aventisia/ui/badge";
import { DTColumnHeader } from "@aventisia/ui/data-table";
import { formatDate } from "@aventisia/ui/utils";
import { ColumnDef } from "@tanstack/react-table";

import { DETAIL_TABLE_KEY } from "../../constants";
import {
  KnowledgeBaseFileDto,
  VectorizationStatus,
} from "../../dtos/kb-file-dto";
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
    header: ({ column }) => (
      <DTColumnHeader
        tableKey={DETAIL_TABLE_KEY}
        column={column}
        title={"File/Document Name"}
        enableHiding={false}
      />
    ),
    cell: ({ row }) => <FileNameCell fileName={row.original.fileName} />,
  },
  {
    accessorKey: "chunksCount",
    header: ({ column }) => (
      <DTColumnHeader
        tableKey={DETAIL_TABLE_KEY}
        column={column}
        title={"Chunks"}
        className="max-w-16"
      />
    ),
    cell: ({ row }) => (
      <div className="w-16 font-medium">{row.original.chunksCount || "—"}</div>
    ),
  },
  {
    accessorKey: "status",
    header: ({ column }) => (
      <DTColumnHeader
        tableKey={DETAIL_TABLE_KEY}
        column={column}
        title={"Status"}
        className="max-w-20"
      />
    ),
    cell: ({ row }) => {
      const status = row.original.status;
      return (
        <Badge variant={statusVariantMap[status] ?? "outline"}>{status}</Badge>
      );
    },
  },
  {
    accessorKey: "createdBy",
    header: ({ column }) => (
      <DTColumnHeader
        tableKey={DETAIL_TABLE_KEY}
        column={column}
        title={"Created By"}
        className="max-w-16"
        enableHiding={false}
      />
    ),
    cell: ({ row }) => (
      <div
        title={row.getValue("createdBy")}
        className="w-28 truncate font-medium"
      >
        {row.getValue("createdBy")}
      </div>
    ),
  },
  {
    accessorKey: "createdOn",
    header: ({ column }) => (
      <DTColumnHeader
        tableKey={DETAIL_TABLE_KEY}
        column={column}
        title={"Created On"}
        className="max-w-16"
        enableHiding={false}
      />
    ),
    cell: ({ row }) => (
      <div className="w-24 font-medium">
        {formatDate(row.original.createdOn)}
      </div>
    ),
  },
  {
    id: "actions",
    size: 48,
    minSize: 48,
    maxSize: 48,
    enableResizing: false,
    cell: ({ row }) => (
      <KBFilesTableRowAction
        row={row.original}
        knowledgeBaseId={knowledgeBaseId}
        knowledgeBase={knowledgeBase}
      />
    ),
  },
];

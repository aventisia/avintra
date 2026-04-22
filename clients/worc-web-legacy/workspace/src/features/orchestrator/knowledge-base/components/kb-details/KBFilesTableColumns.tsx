import { DTColumnHeader } from "@aventisia/ui/data-table";
import { dateFormatter } from "@aventisia/ui/utils";
import { ColumnDef } from "@tanstack/react-table";

import { DETAIL_TABLE_KEY } from "../../constants";
import { KnowledgeBaseFileDto } from "../../dtos/kb-file-dto";
import { KnowledgeBaseTableDto } from "../../dtos/knowledge-base-table-dto";
import { KBFilesTableRowAction } from "./KBFilesTableRowAction";

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
        title={"File Name"}
        enableHiding={false}
      />
    ),
    cell: ({ row }) => (
      <div className="w-auto truncate font-medium">{row.original.fileName}</div>
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
        enableHiding={false}
      />
    ),
    cell: ({ row }) => (
      <div className="w-auto truncate font-medium">
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
      <div className="w-auto  font-medium">
        {row.original.createdOn ? dateFormatter(row.original.createdOn) : "NA"}
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

import { DTColumnHeader, createDTActionsColumn } from "@avplatform/ui/data-table";
import { formatDate } from "@avplatform/ui/utils";
import { ColumnDef } from "@tanstack/react-table";

import { DETAIL_TABLE_KEY } from "../../constants";
import { getColumnName } from "../../constants/skill-files-column-display-names.constant";
import { SkillFileDto } from "../../dtos/skill-file.dto";
import { SkillTableDto } from "../../dtos/skill-table.dto";
import { FileNameCell } from "./FileNameCell";
import { SkillFilesTableRowAction } from "./SkillFilesTableRowAction";

/**
 * Array of table columns for the skill files table.
 */
export const getSkillFilesTableColumns = (
  skillId: string,
  skill?: SkillTableDto,
): ColumnDef<SkillFileDto>[] => [
  {
    accessorKey: "fileName",
    header: ({ column }) => (
      <DTColumnHeader
        tableKey={DETAIL_TABLE_KEY}
        column={column}
        title={getColumnName("fileName")}
        enableHiding={false}
      />
    ),
    cell: ({ row }) => <FileNameCell fileName={row.original.fileName} />,
  },
  {
    accessorKey: "fileType",
    header: ({ column }) => (
      <DTColumnHeader
        tableKey={DETAIL_TABLE_KEY}
        column={column}
        title={getColumnName("fileType")}
        className="max-w-20"
      />
    ),
    cell: ({ row }) => <span className="capitalize text-xs">{row.original.fileType || "-"}</span>,
  },
  {
    accessorKey: "createdBy",
    header: ({ column }) => (
      <DTColumnHeader
        tableKey={DETAIL_TABLE_KEY}
        column={column}
        title={getColumnName("createdBy")}
        className="max-w-16"
        enableHiding={false}
      />
    ),
    cell: ({ row }) => (
      <div title={row.getValue("createdBy")} className="w-28 truncate font-medium">
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
        title={getColumnName("createdOn")}
        className="max-w-16"
        enableHiding={false}
      />
    ),
    cell: ({ row }) => (
      <div className="w-24 font-medium font-mono tabular-nums">
        {formatDate(row.original.createdOn)}
      </div>
    ),
  },
  createDTActionsColumn<SkillFileDto>({
    size: 48,
    minSize: 48,
    maxSize: 48,
    enableResizing: false,
    renderCell: (row) => <SkillFilesTableRowAction row={row} skillId={skillId} skill={skill} />,
  }),
];

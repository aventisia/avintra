import { TableCNColumnHeader } from "@avplatform/ui/table-cn";
import { formatDate } from "@avplatform/ui/utils";
import { ColumnDef, HeaderContext } from "@tanstack/react-table";

import { getRowActionsColumn } from "@/utils/get-row-actions-column.util";

import { getColumnName } from "../../constants/skill-files-column-display-names.constant";
import { SkillFileDto } from "../../dtos/skill-file.dto";
import { SkillTableDto } from "../../dtos/skill-table.dto";
import { FileNameCell } from "./FileNameCell";
import { SkillFilesTableRowAction } from "./SkillFilesTableRowAction";

const renderHeader =
  (columnKey: string) =>
  ({ column }: HeaderContext<SkillFileDto, unknown>) => (
    <TableCNColumnHeader column={column} label={getColumnName(columnKey)} />
  );

/**
 * Array of table columns for the skill files table.
 */
export const getSkillFilesTableColumns = (
  skillId: string,
  skill?: SkillTableDto,
): ColumnDef<SkillFileDto>[] => [
  {
    accessorKey: "fileName",
    meta: { label: getColumnName("fileName") },
    enableHiding: false,
    header: renderHeader("fileName"),
    cell: ({ row }) => <FileNameCell fileName={row.original.fileName} />,
  },
  {
    accessorKey: "fileType",
    meta: { label: getColumnName("fileType") },
    header: ({ column }) => (
      <TableCNColumnHeader className="max-w-20" column={column} label={getColumnName("fileType")} />
    ),
    cell: ({ row }) => <span className="capitalize text-xs">{row.original.fileType || "-"}</span>,
  },
  {
    accessorKey: "createdBy",
    meta: { label: getColumnName("createdBy") },
    enableHiding: false,
    header: ({ column }) => (
      <TableCNColumnHeader
        className="max-w-16"
        column={column}
        label={getColumnName("createdBy")}
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
    meta: { label: getColumnName("createdOn") },
    enableHiding: false,
    header: ({ column }) => (
      <TableCNColumnHeader
        className="max-w-16"
        column={column}
        label={getColumnName("createdOn")}
      />
    ),
    cell: ({ row }) => (
      <div className="w-24 font-medium font-mono tabular-nums">
        {formatDate(row.original.createdOn)}
      </div>
    ),
  },
  getRowActionsColumn<SkillFileDto>({
    size: 48,
    minSize: 48,
    maxSize: 48,
    enableResizing: false,
    actions: ({ row }) => (
      <SkillFilesTableRowAction row={row.original} skillId={skillId} skill={skill} />
    ),
  }),
];

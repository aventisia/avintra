import { ProjectTypesEnum } from "@/react-toolkit/enums/project-types-enum";
import { Checkbox } from "@/react-toolkit/ui/checkbox";
import { DTColumnHeader } from "@/react-toolkit/ui/data-table/DTColumnHeader";
import { getEnumValueByKey } from "@/react-toolkit/utils/enum-to-array";
import { ColumnDef } from "@tanstack/react-table";
import { formatDistanceToNow } from "date-fns";
import { getColumnName } from "../constants/column-display-names";
import { ProjectsTableDto } from "../dtos/projects-table-dto";
import { ProjectsTableCellLink } from "./ProjectsTableCellLink";
import { ProjectRowActions } from "./project-row-actions/ProjectRowActions";

/**
 * Array of table columns for the projects table.
 * Each column object contains an accessorKey, header component, and cell component.
 */
export const projectsTableColumns: ColumnDef<ProjectsTableDto>[] = [
  {
    accessorKey: "id",
    header: ({ table }) => (
      <Checkbox
        checked={
          table.getIsAllPageRowsSelected() ||
          (table.getIsSomePageRowsSelected() && "indeterminate")
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
      <DTColumnHeader column={column} title={getColumnName("name")} />
    ),
    cell: ({ row }) => (
      <ProjectsTableCellLink
        rowId={row.original.id || "rowId"}
        cellValue={row.getValue("name")}
      />
    ),
  },
  {
    accessorKey: "type",
    header: ({ column }) => (
      <DTColumnHeader column={column} title={getColumnName("type")} />
    ),
    cell: ({ row }) => (
      <div className="w-auto truncate font-medium">
        {getEnumValueByKey(ProjectTypesEnum, row.getValue("type"))}
      </div>
    ),
  },
  {
    accessorKey: "flowCount",
    header: ({ column }) => (
      <DTColumnHeader column={column} title={getColumnName("flowCount")} />
    ),
    cell: ({ row }) => (
      <div className="w-auto truncate font-medium">
        {row.getValue("flowCount")}
      </div>
    ),
  },
  {
    accessorKey: "createdBy",
    header: ({ column }) => (
      <DTColumnHeader column={column} title={getColumnName("createdBy")} />
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
        className="w-[7rem]"
        column={column}
        title={getColumnName("createdOn")}
      />
    ),
    cell: ({ row }) => (
      <div className="w-auto truncate font-medium">
        {formatDistanceToNow(row.getValue("createdOn"), {
          addSuffix: true,
        })}
      </div>
    ),
  },
  {
    id: "actions",
    cell: ({ row }) => (
      // Render the projects row actions component
      <ProjectRowActions rowId={row.original.id || "rowId"} />
    ),
  },
];

import { DTColumnHeader } from "@/react-toolkit/ui/data-table/DTColumnHeader";
import { ColumnDef } from "@tanstack/react-table";
import { formatDistanceToNow } from "date-fns";
import { ProjectsTableDto } from "../dtos/projects-table-dto";
import { ProjectsTableCellLink } from "./ProjectsTableCellLink";
import { ProjectsTableRowActions } from "./ProjectsTableRowActions";

/**
 * Array of table columns for the projects table.
 * Each column object contains an accessorKey, header component, and cell component.
 */
export const projectsTableColumns: ColumnDef<ProjectsTableDto>[] = [
  {
    accessorKey: "name",
    header: ({ column }) => <DTColumnHeader column={column} title="Name" />,
    cell: ({ row }) => (
      <ProjectsTableCellLink
        rowId={row.original.id || "rowId"}
        cellValue={row.getValue("name")}
      />
    ),
  },
  {
    accessorKey: "type",
    header: ({ column }) => <DTColumnHeader column={column} title="Type" />,
    cell: ({ row }) => (
      <div className="w-auto truncate font-medium">{row.getValue("type")}</div>
    ),
  },
  {
    accessorKey: "flowCount",
    header: ({ column }) => <DTColumnHeader column={column} title="Flows" />,
    cell: ({ row }) => (
      <div className="w-auto truncate font-medium">
        {row.getValue("flowCount")}
      </div>
    ),
  },
  {
    accessorKey: "createdBy",
    header: ({ column }) => (
      <DTColumnHeader column={column} title="Created By" />
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
      <DTColumnHeader className="w-[7rem]" column={column} title="Created On" />
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
      <ProjectsTableRowActions rowId={row.original.id || "rowId"} />
    ),
  },
];

import { dateFormat } from "@/react-toolkit/constants";
import { Checkbox } from "@/react-toolkit/ui/checkbox";
import { DTColumnHeader } from "@/react-toolkit/ui/data-table/DTColumnHeader";
import { ColumnDef } from "@tanstack/react-table";

import { getColumnName } from "../constants/column-display-names";
import { RolesTableDto } from "../dtos/roles-table-dto";
import { RoleRowActions } from "./role-row-actions/RoleRowActions";

/**
 * Array of table columns for the roles table.
 * Each column object contains an accessorKey, header component, and cell component.
 */
export const rolesTableColumns: ColumnDef<RolesTableDto>[] = [
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
      <div className="w-auto truncate font-medium">{row.getValue("name")}</div>
    ),
  },

  {
    accessorKey: "description",
    header: ({ column }) => (
      <DTColumnHeader column={column} title={getColumnName("description")} />
    ),
    cell: ({ row }) => (
      <div className="w-7/12 truncate text-pretty font-medium">
        {row.getValue("description")}
      </div>
    ),
  },
  {
    accessorKey: "userCount",
    header: ({ column }) => (
      <DTColumnHeader column={column} title={getColumnName("userCount")} />
    ),
    cell: ({ row }) => (
      <div className="w-auto truncate font-medium">
        {row.getValue<string[]>("userCount")?.slice(-1)}
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
        {dateFormat(row.getValue("createdOn"))}
      </div>
    ),
  },
  {
    id: "actions",
    cell: ({ row }) => (
      // Render the roles row actions component
      <RoleRowActions rowId={row.original.id || "rowId"} />
    ),
  },
];

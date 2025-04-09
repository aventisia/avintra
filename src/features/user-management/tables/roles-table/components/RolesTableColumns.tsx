import { dateFormat } from "@/react-toolkit/constants";
import { Checkbox } from "@/react-toolkit/ui/checkbox";
import { DTColumnHeader } from "@/react-toolkit/ui/data-table/DTColumnHeader";
import { ColumnDef } from "@tanstack/react-table";

import { getColumnName } from "../constants/column-display-names";
import { RoleTableDTO } from "../dtos/roles-table-dto";
import { RoleRowActions } from "./role-row-actions/RoleRowActions";

/**
 * Array of table columns for the users table.
 * Each column object contains an accessorKey, header component, and cell component.
 */
export const RolesTableColumns: ColumnDef<RoleTableDTO>[] = [
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
      <div className="w-auto truncate font-medium">
        {row.getValue("description")}
      </div>
    ),
  },
  {
    accessorKey: "users",
    header: ({ column }) => (
      <DTColumnHeader column={column} title={getColumnName("users")} />
    ),
    cell: ({ row }) => (
      <div className="w-auto truncate font-medium">{row.getValue("users")}</div>
    ),
  },
  {
    accessorKey: "totalPermission",
    header: ({ column }) => (
      <DTColumnHeader
        column={column}
        title={getColumnName("totalPermission")}
      />
    ),
    cell: ({ row }) => (
      <div className="w-auto truncate font-medium">
        {row.getValue("totalPermission")}
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
        {dateFormat(row.getValue("createdOn"))}
      </div>
    ),
  },
  {
    accessorKey: "lastUpdatedBy",
    header: ({ column }) => (
      <DTColumnHeader column={column} title={getColumnName("lastUpdatedBy")} />
    ),
    cell: ({ row }) => (
      <div className="w-auto truncate font-medium">
        {row.getValue("lastUpdatedBy")}
      </div>
    ),
  },
  {
    accessorKey: "lastUpdatedOn",
    header: ({ column }) => (
      <DTColumnHeader
        className="w-[7rem]"
        column={column}
        title={getColumnName("lastUpdatedOn")}
      />
    ),
    cell: ({ row }) => (
      <div className="w-auto truncate font-medium">
        {dateFormat(row.getValue("lastUpdatedOn"))}
      </div>
    ),
  },
  {
    accessorKey: "isDefault",
    header: ({ column }) => (
      <DTColumnHeader column={column} title={getColumnName("isDefault")} />
    ),
    cell: ({ row }) => (
      <div className="w-auto truncate font-medium">
        {row.getValue("isDefault")}
      </div>
    ),
  },
  {
    id: "actions",
    cell: ({ row }) => (
      // Render the users row actions component
      <RoleRowActions rowId={row.original.id || "rowId"} />
    ),
  },
];

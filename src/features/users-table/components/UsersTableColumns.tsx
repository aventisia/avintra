import { DTColumnHeader } from "@/react-toolkit/ui/data-table/DTColumnHeader";
import { ColumnDef } from "@tanstack/react-table";
import { formatDistanceToNow } from "date-fns";
import { UsersTableDto } from "../dtos/users-table-dto";
import { UserRowActions } from "./user-row-actions/UserRowActions";

/**
 * Array of table columns for the users table.
 * Each column object contains an accessorKey, header component, and cell component.
 */
export const usersTableColumns: ColumnDef<UsersTableDto>[] = [
  {
    accessorKey: "firstName",
    header: ({ column }) => (
      <DTColumnHeader column={column} title="First Name" />
    ),
    cell: ({ row }) => (
      <div className="w-auto truncate font-medium">
        {row.getValue("firstName")}
      </div>
    ),
  },
  {
    accessorKey: "lastName",
    header: ({ column }) => (
      <DTColumnHeader column={column} title="Last Name" />
    ),
    cell: ({ row }) => (
      <div className="w-auto truncate font-medium">
        {row.getValue("lastName")}
      </div>
    ),
  },

  {
    accessorKey: "email",
    header: ({ column }) => <DTColumnHeader column={column} title="Email" />,
    cell: ({ row }) => (
      <div className="w-auto truncate font-medium">{row.getValue("email")}</div>
    ),
  },
  {
    accessorKey: "userRoles",
    header: ({ column }) => <DTColumnHeader column={column} title="Top Role" />,
    cell: ({ row }) => (
      <div className="w-auto truncate font-medium">
        {(row.getValue("userRoles") as string[])?.slice(-1)}
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
        {row.original.createdOn &&
          formatDistanceToNow(row.getValue("createdOn"), {
            addSuffix: true,
          })}
      </div>
    ),
  },
  {
    id: "actions",
    cell: ({ row }) => (
      // Render the users row actions component
      <UserRowActions rowId={row.original.id || "rowId"} />
    ),
  },
];

import { Checkbox } from "@avplatform/ui";
import { DTColumnHeader, createDTActionsColumn } from "@avplatform/ui/data-table";
import { Tooltip } from "@avplatform/ui/tooltip";
import { formatDate } from "@avplatform/ui/utils";
import { ColumnDef } from "@tanstack/react-table";

import { TABLE_KEY } from "../constants";
import { getColumnName } from "../constants/column-display-names";
import { UsersTableDto } from "../dtos/users-table-dto";
import { UserRowActions } from "./user-row-actions/UserRowActions";

/**
 * Array of table columns for the users table.
 * Each column object contains an accessorKey, header component, and cell component.
 *
 * @param spaceIdToName A map of space ID -> space name, used to render the Spaces column.
 */
export const usersTableColumns = (
  spaceIdToName: Map<string, string> = new Map(),
): ColumnDef<UsersTableDto>[] => [
  {
    accessorKey: "id",
    header: ({ table }) => (
      <Checkbox
        checked={
          table.getIsAllPageRowsSelected() || (table.getIsSomePageRowsSelected() && "indeterminate")
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
    accessorKey: "firstName",
    header: ({ column }) => (
      <DTColumnHeader tableKey={TABLE_KEY} column={column} title={getColumnName("firstName")} />
    ),
    cell: ({ row }) => (
      <div className="w-auto truncate font-medium">{row.getValue("firstName")}</div>
    ),
  },
  {
    accessorKey: "lastName",
    header: ({ column }) => (
      <DTColumnHeader tableKey={TABLE_KEY} column={column} title={getColumnName("lastName")} />
    ),
    cell: ({ row }) => (
      <div className="w-auto truncate font-medium">{row.getValue("lastName")}</div>
    ),
  },

  {
    accessorKey: "email",
    header: ({ column }) => (
      <DTColumnHeader tableKey={TABLE_KEY} column={column} title={getColumnName("email")} />
    ),
    cell: ({ row }) => <div className="w-auto truncate font-medium">{row.getValue("email")}</div>,
  },
  {
    accessorKey: "userRoles",
    header: ({ column }) => (
      <DTColumnHeader tableKey={TABLE_KEY} column={column} title={getColumnName("userRoles")} />
    ),
    cell: ({ row }) => (
      <div className="w-auto truncate font-medium">
        {row.getValue<string[]>("userRoles")?.slice(-1)}
      </div>
    ),
  },
  {
    accessorKey: "spaces",
    header: ({ column }) => (
      <DTColumnHeader tableKey={TABLE_KEY} column={column} title={getColumnName("spaces")} />
    ),
    cell: ({ row }) => {
      const spaceIds = row.getValue<string[]>("spaces") || [];
      const names = spaceIds.map((id) => spaceIdToName.get(id) ?? id).filter(Boolean);
      const display = names.join(", ") || "-";
      return (
        <Tooltip content={display} side="top" className="max-w-[22rem] whitespace-normal">
          <div className="w-auto max-w-[12rem] truncate font-medium">{display}</div>
        </Tooltip>
      );
    },
  },
  {
    accessorKey: "createdOn",
    header: ({ column }) => (
      <DTColumnHeader
        tableKey={TABLE_KEY}
        className="w-[7rem]"
        column={column}
        title={getColumnName("createdOn")}
      />
    ),
    cell: ({ row }) => (
      <div className="w-auto truncate font-medium">{formatDate(row.getValue("createdOn"))}</div>
    ),
  },
  createDTActionsColumn<UsersTableDto>({
    renderCell: (row) => <UserRowActions rowId={row.id || "rowId"} />,
  }),
];

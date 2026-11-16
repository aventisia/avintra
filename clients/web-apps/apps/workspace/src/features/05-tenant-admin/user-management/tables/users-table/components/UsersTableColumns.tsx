import { TableCNColumnHeader, getTableCNSelectColumn } from "@avplatform/ui/table-cn";
import { Tooltip } from "@avplatform/ui/tooltip";
import { formatDate } from "@avplatform/ui/utils";
import { ColumnDef, HeaderContext } from "@tanstack/react-table";

import { getRowActionsColumn } from "@/utils/get-row-actions-column.util";

import { getColumnName } from "../constants/column-display-names";
import { UsersTableDto } from "../dtos/users-table-dto";
import { UserRowActions } from "./user-row-actions/UserRowActions";

const renderHeader =
  (columnKey: string) =>
  ({ column }: HeaderContext<UsersTableDto, unknown>) => (
    <TableCNColumnHeader column={column} label={getColumnName(columnKey)} />
  );

/**
 * Array of table columns for the users table.
 * Each column object contains an accessorKey, header component, and cell component.
 *
 * @param spaceIdToName A map of space ID -> space name, used to render the Spaces column.
 */
export const usersTableColumns = (
  spaceIdToName: Map<string, string> = new Map(),
): ColumnDef<UsersTableDto>[] => [
  getTableCNSelectColumn<UsersTableDto>({
    enableHiding: true,
    meta: { label: getColumnName("select") },
  }),
  {
    accessorKey: "firstName",
    meta: { label: getColumnName("firstName") },
    header: renderHeader("firstName"),
    cell: ({ row }) => (
      <div className="w-auto truncate font-medium">{row.getValue("firstName")}</div>
    ),
  },
  {
    accessorKey: "lastName",
    meta: { label: getColumnName("lastName") },
    header: renderHeader("lastName"),
    cell: ({ row }) => (
      <div className="w-auto truncate font-medium">{row.getValue("lastName")}</div>
    ),
  },

  {
    accessorKey: "email",
    meta: { label: getColumnName("email") },
    header: renderHeader("email"),
    cell: ({ row }) => <div className="w-auto truncate font-medium">{row.getValue("email")}</div>,
  },
  {
    accessorKey: "userRoles",
    meta: { label: getColumnName("userRoles") },
    header: renderHeader("userRoles"),
    cell: ({ row }) => (
      <div className="w-auto truncate font-medium">
        {row.getValue<string[]>("userRoles")?.slice(-1)}
      </div>
    ),
  },
  {
    accessorKey: "spaces",
    meta: { label: getColumnName("spaces") },
    header: renderHeader("spaces"),
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
    meta: { label: getColumnName("createdOn") },
    header: ({ column }) => (
      <TableCNColumnHeader
        className="w-[7rem]"
        column={column}
        label={getColumnName("createdOn")}
      />
    ),
    cell: ({ row }) => (
      <div className="w-auto truncate font-mono font-medium tabular-nums">
        {formatDate(row.getValue("createdOn"))}
      </div>
    ),
  },
  getRowActionsColumn<UsersTableDto>({
    actions: ({ row }) => <UserRowActions rowId={row.original.id || "rowId"} />,
  }),
];

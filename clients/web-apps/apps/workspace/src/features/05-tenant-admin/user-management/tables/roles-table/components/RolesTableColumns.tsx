import { TableCNColumnHeader, getTableCNSelectColumn } from "@avplatform/ui/table-cn";
import { formatDate } from "@avplatform/ui/utils";
import { ColumnDef, HeaderContext } from "@tanstack/react-table";

import { getRowActionsColumn } from "@/utils/get-row-actions-column.util";

import { getColumnName } from "../constants/column-display-names";
import { RoleTableDTO } from "../dtos/roles-table-dto";
import { RoleRowActions } from "./role-row-actions/RoleRowActions";

const renderHeader =
  (columnKey: string) =>
  ({ column }: HeaderContext<RoleTableDTO, unknown>) => (
    <TableCNColumnHeader column={column} label={getColumnName(columnKey)} />
  );

/**
 * Array of table columns for the users table.
 * Each column object contains an accessorKey, header component, and cell component.
 */
export const RolesTableColumns: ColumnDef<RoleTableDTO>[] = [
  getTableCNSelectColumn<RoleTableDTO>({
    enableHiding: true,
    meta: { label: getColumnName("select") },
  }),
  {
    accessorKey: "fullName",
    meta: { label: getColumnName("fullName") },
    header: renderHeader("fullName"),
    cell: ({ row }) => (
      <div className="w-auto truncate font-medium">{row.getValue("fullName")}</div>
    ),
  },
  {
    accessorKey: "description",
    meta: { label: getColumnName("description") },
    header: ({ column }) => (
      <TableCNColumnHeader className="w-fit" column={column} label={getColumnName("description")} />
    ),
    cell: ({ row }) => (
      <div className="w-72 truncate text-pretty font-medium">{row.getValue("description")}</div>
    ),
  },
  {
    accessorKey: "users",
    meta: { label: getColumnName("users") },
    header: renderHeader("users"),
    cell: ({ row }) => (
      <div className="font-mono tabular-nums w-auto truncate font-medium">
        {row.getValue("users")}
      </div>
    ),
  },
  {
    accessorKey: "totalPermission",
    meta: { label: getColumnName("totalPermission") },
    header: renderHeader("totalPermission"),
    cell: ({ row }) => (
      <div className="font-mono tabular-nums w-auto truncate font-medium">
        {row.getValue("totalPermission")}
      </div>
    ),
  },
  {
    accessorKey: "createdBy",
    meta: { label: getColumnName("createdBy") },
    header: renderHeader("createdBy"),
    cell: ({ row }) => (
      <div className="w-auto truncate font-medium">{row.getValue("createdBy")}</div>
    ),
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
      <div className="font-mono tabular-nums w-auto truncate font-medium">
        {formatDate(row.getValue("createdOn"))}
      </div>
    ),
  },
  {
    accessorKey: "lastUpdatedBy",
    meta: { label: getColumnName("lastUpdatedBy") },
    header: renderHeader("lastUpdatedBy"),
    cell: ({ row }) => (
      <div className="w-auto truncate font-medium">{row.getValue("lastUpdatedBy")}</div>
    ),
  },
  {
    accessorKey: "lastUpdatedOn",
    meta: { label: getColumnName("lastUpdatedOn") },
    header: ({ column }) => (
      <TableCNColumnHeader
        className="w-[7rem]"
        column={column}
        label={getColumnName("lastUpdatedOn")}
      />
    ),
    cell: ({ row }) => (
      <div className="font-mono tabular-nums w-auto truncate font-medium">
        {formatDate(row.getValue("lastUpdatedOn"))}
      </div>
    ),
  },
  {
    accessorKey: "isDefault",
    meta: { label: getColumnName("isDefault") },
    header: renderHeader("isDefault"),
    cell: ({ row }) => (
      <div className="w-auto truncate font-medium">{row.getValue("isDefault")}</div>
    ),
  },
  getRowActionsColumn<RoleTableDTO>({
    actions: ({ row }) => <RoleRowActions rowId={row.original.id || "rowId"} />,
  }),
];

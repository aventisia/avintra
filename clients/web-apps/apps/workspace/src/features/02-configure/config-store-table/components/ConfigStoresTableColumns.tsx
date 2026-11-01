import { ConfigStoreTypesEnum } from "@avplatform/ui/enums/config-store-types-enum";
import { TableCNColumnHeader, getTableCNSelectColumn } from "@avplatform/ui/table-cn";
import { formatDate, getEnumValueByKey } from "@avplatform/ui/utils";
import { ColumnDef, HeaderContext } from "@tanstack/react-table";

import { getRowActionsColumn } from "@/utils/get-row-actions-column.util";

import { getColumnName } from "../constants/column-display-names";
import { ConfigStoresTableDto } from "../dtos/config-stores-table-dto";
import { ConfigStoreRowActions } from "./config-store-row-actions/ConfigStoreRowActions";

const renderHeader =
  (columnKey: string) =>
  ({ column }: HeaderContext<ConfigStoresTableDto, unknown>) => (
    <TableCNColumnHeader column={column} label={getColumnName(columnKey)} />
  );

/**
 * Array of table columns for the config stores table.
 * Each column object contains an accessorKey, header component, and cell component.
 */
export const configStoresTableColumns = (): ColumnDef<ConfigStoresTableDto>[] => [
  getTableCNSelectColumn<ConfigStoresTableDto>({
    enableHiding: true,
    meta: { label: getColumnName("select") },
  }),
  {
    accessorKey: "name",
    meta: { label: getColumnName("name") },
    header: renderHeader("name"),
    cell: ({ row }) => (
      <div className="flex max-w-80 items-center gap-3 ">
        <div className="w-auto truncate font-medium">{row.getValue("name")}</div>
        <p className="bg-muted border text-nowrap p-1  text-2xs leading-none  text-ink-2 rounded-sm">
          {row.original.accessLevel?.replace(/([A-Z])/g, " $1")}
        </p>
      </div>
    ),
  },
  {
    accessorKey: "type",
    meta: { label: getColumnName("type") },
    header: renderHeader("type"),
    cell: ({ row }) => (
      <div className="w-auto truncate font-medium">
        {getEnumValueByKey(ConfigStoreTypesEnum, row.getValue("type"))}
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
      <div className="w-auto truncate font-medium font-mono tabular-nums">
        {formatDate(row.getValue("createdOn"))}
      </div>
    ),
  },
  getRowActionsColumn<ConfigStoresTableDto>({
    actions: ({ row }) => (
      <ConfigStoreRowActions
        rowId={row.original.id || "rowId"}
        accessLevel={row.original.accessLevel}
        name={row.original.name}
        isTenantWideAccess={row.original.isTenantWideAccess || false}
        isResourceAccessRestricted={row.original.isResourceAccessRestricted}
      />
    ),
  }),
];

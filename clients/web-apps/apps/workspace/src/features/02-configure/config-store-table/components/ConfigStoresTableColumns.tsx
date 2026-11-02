import { ConfigStoreTypesEnum } from "@avplatform/ui/enums/config-store-types-enum";
import { HighlightedText } from "@avplatform/ui/highlighted-text";
import { TableCNColumnHeader, getTableCNSelectColumn } from "@avplatform/ui/table-cn";
import { formatDate, getEnumValueByKey } from "@avplatform/ui/utils";
import { ColumnDef, HeaderContext } from "@tanstack/react-table";

import { PersonAvatar } from "@/components/PersonAvatar";
import { ACCESS_LEVELS } from "@/features/01-build/flows-table/constants/agent-attributes.constant";
import { getAccessLevelLabel } from "@/features/01-build/flows-table/utils/agent-attributes.util";
import { getRowActionsColumn } from "@/utils/get-row-actions-column.util";

import { getColumnName } from "../constants/column-display-names";
import { ConfigStoresTableDto } from "../dtos/config-stores-table-dto";
import { ConfigStoreRowActions } from "./config-store-row-actions/ConfigStoreRowActions";

const EMPTY_VALUE = <span className="text-muted-foreground">-</span>;

const renderHeader =
  (columnKey: string) =>
  ({ column }: HeaderContext<ConfigStoresTableDto, unknown>) => (
    <TableCNColumnHeader column={column} label={getColumnName(columnKey)} />
  );

const getLabelMeta = (columnKey: string) => ({ label: getColumnName(columnKey) });

const TYPE_OPTIONS = Object.keys(ConfigStoreTypesEnum).map((key) => ({
  value: key,
  label: getEnumValueByKey(ConfigStoreTypesEnum, key),
}));

const ACCESS_OPTIONS = Object.entries(ACCESS_LEVELS).map(([value, { label }]) => ({
  value,
  label,
}));

/**
 * Columns of the key stores table. Cells mirror the Agents page: a highlighted name,
 * plain access text, avatar creators, and mono dates.
 */
export const configStoresTableColumns = ({
  searchText,
}: {
  searchText: string;
}): ColumnDef<ConfigStoresTableDto>[] => [
  getTableCNSelectColumn<ConfigStoresTableDto>({
    enableHiding: true,
    meta: getLabelMeta("select"),
  }),
  {
    accessorKey: "name",
    meta: getLabelMeta("name"),
    header: renderHeader("name"),
    cell: ({ row }) => (
      <div className="w-auto max-w-80 truncate font-semibold text-ink">
        <HighlightedText text={row.original.name} query={searchText} />
      </div>
    ),
  },
  {
    accessorKey: "type",
    meta: {
      ...getLabelMeta("type"),
      variant: "multiSelect",
      options: TYPE_OPTIONS,
    },
    header: renderHeader("type"),
    cell: ({ row }) => (
      <span className="text-ink-2">
        {getEnumValueByKey(ConfigStoreTypesEnum, String(row.getValue("type")))}
      </span>
    ),
  },
  {
    accessorKey: "accessLevel",
    meta: {
      ...getLabelMeta("accessLevel"),
      variant: "multiSelect",
      options: ACCESS_OPTIONS,
    },
    header: renderHeader("accessLevel"),
    cell: ({ row }) => {
      const accessLevel = row.getValue("accessLevel") as string | undefined;
      if (!accessLevel) return EMPTY_VALUE;
      return <span className="text-ink-2">{getAccessLevelLabel(accessLevel)}</span>;
    },
  },
  {
    accessorKey: "createdBy",
    meta: getLabelMeta("createdBy"),
    header: renderHeader("createdBy"),
    cell: ({ row }) => {
      const name = row.getValue("createdBy") as string | undefined;
      if (!name) return EMPTY_VALUE;
      return (
        <span className="inline-flex min-w-0 items-center gap-2">
          <PersonAvatar name={name} />
          <span className="max-w-[12rem] truncate text-ink-2">{name}</span>
        </span>
      );
    },
  },
  {
    accessorKey: "createdOn",
    meta: getLabelMeta("createdOn"),
    header: renderHeader("createdOn"),
    cell: ({ row }) => (
      <span
        className="font-mono text-[12.5px] tabular-nums text-ink-2"
        title={formatDate(row.getValue("createdOn"), true)}
      >
        {formatDate(row.getValue("createdOn"))}
      </span>
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

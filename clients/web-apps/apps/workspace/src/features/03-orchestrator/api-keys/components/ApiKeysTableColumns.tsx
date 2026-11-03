import { Badge } from "@avplatform/ui/badge";
import { FALLBACK_VALUE } from "@avplatform/ui/constants";
import { CrudOpenViewCell } from "@avplatform/ui/crud-dialog";
import { TableCNColumnHeader, getTableCNSelectColumn } from "@avplatform/ui/table-cn";
import { formatDate } from "@avplatform/ui/utils";
import { ColumnDef, HeaderContext } from "@tanstack/react-table";

import { getRowActionsColumn } from "@/utils/get-row-actions-column.util";

import { getColumnName } from "../constants/column-display-names";
import type { ApiKeyPermissions } from "../dtos/api-key-permissions.dto";
import type { ApiKeyDto } from "../dtos/api-key.dto";
import { formatPermissions } from "../utils/api-key-permissions.util";
import { getApiKeyStatus } from "../utils/api-key-status.util";
import { ApiKeyRowActions } from "./api-key-row-actions/ApiKeyRowActions";

const renderHeader =
  (columnKey: string) =>
  ({ column }: HeaderContext<ApiKeyDto, unknown>) => (
    <TableCNColumnHeader column={column} label={getColumnName(columnKey)} />
  );

/**
 * Builds the array of table columns for the API keys table.
 */
export const getApiKeysTableColumns = (): ColumnDef<ApiKeyDto>[] => [
  getTableCNSelectColumn<ApiKeyDto>({
    enableHiding: true,
    meta: { label: getColumnName("select") },
  }),
  {
    accessorKey: "name",
    meta: { label: getColumnName("name") },
    header: renderHeader("name"),
    cell: ({ row }) => (
      <CrudOpenViewCell
        rowId={row.original.id}
        cellContent={row.getValue("name")}
        entity="apiKey"
      />
    ),
  },
  {
    id: "status",
    accessorFn: (row) => `${row.isRevoked ? "Revoked" : (row.expiresAt ?? "Active")}`,
    meta: { label: getColumnName("status") },
    size: 140,
    minSize: 120,
    header: renderHeader("status"),
    cell: ({ row }) => {
      const expiresAt = row.original.expiresAt;
      const isRevoked = row.original.isRevoked;
      const status = getApiKeyStatus(expiresAt, isRevoked);
      return <Badge variant={status.variant}>{status.label}</Badge>;
    },
  },
  {
    accessorKey: "keyPrefix",
    meta: { label: getColumnName("keyPrefix") },
    header: renderHeader("keyPrefix"),
    cell: ({ row }) => {
      const prefix = row.getValue<string | null>("keyPrefix");
      return (
        <div className="w-auto truncate font-mono tabular-nums text-muted-foreground">
          {prefix || "-"}
        </div>
      );
    },
  },
  {
    accessorKey: "expiresAt",
    meta: { label: getColumnName("expiresAt") },
    header: renderHeader("expiresAt"),
    cell: ({ row }) => {
      const expiresAt = row.getValue<string | null>("expiresAt");
      const formattedDate = formatDate(expiresAt, true);
      if (!formattedDate || formattedDate === "01 Jan 0001") {
        return <div className="truncate font-mono tabular-nums">{FALLBACK_VALUE}</div>;
      }
      return <div className="truncate font-mono tabular-nums">{formattedDate}</div>;
    },
  },
  {
    accessorKey: "lastUsedAt",
    meta: { label: getColumnName("lastUsedAt") },
    header: renderHeader("lastUsedAt"),
    cell: ({ row }) => {
      const formattedDate = formatDate(row.getValue("lastUsedAt"), true);
      if (!formattedDate || formattedDate === "01 Jan 0001") {
        return <div className="w-auto truncate font-mono tabular-nums">{FALLBACK_VALUE}</div>;
      }
      return <div className="w-auto truncate font-mono tabular-nums">{formattedDate}</div>;
    },
  },
  {
    accessorKey: "permissions",
    meta: { label: getColumnName("permissions") },
    header: renderHeader("permissions"),
    cell: ({ row }) => {
      const permissions = row.getValue<ApiKeyPermissions | null>("permissions");
      const formatted = formatPermissions(permissions);
      return (
        <div className="max-w-40 truncate font-medium" title={formatted}>
          {formatted}
        </div>
      );
    },
  },
  {
    accessorKey: "createdBy",
    meta: { label: getColumnName("createdBy") },
    header: renderHeader("createdBy"),
    cell: ({ row }) => {
      const value = row.getValue<string | null>("createdBy");
      return (
        <div className="max-w-40 truncate font-medium" title={value ?? undefined}>
          {value || "-"}
        </div>
      );
    },
  },
  {
    accessorKey: "createdOn",
    meta: { label: getColumnName("createdOn") },
    header: renderHeader("createdOn"),
    cell: ({ row }) => {
      const raw = row.getValue<string | null>("createdOn");
      const shortDate = formatDate(raw, false);
      const fullDate = formatDate(raw, true);
      if (!shortDate || shortDate === "01 Jan 0001") {
        return <div className="max-w-40 truncate font-mono tabular-nums">{FALLBACK_VALUE}</div>;
      }
      return (
        <div className="max-w-40 truncate font-mono tabular-nums" title={fullDate}>
          {shortDate}
        </div>
      );
    },
  },
  {
    accessorKey: "lastModifiedBy",
    meta: { label: getColumnName("lastModifiedBy") },
    header: renderHeader("lastModifiedBy"),
    cell: ({ row }) => {
      const value = row.getValue<string | null>("lastModifiedBy");
      return (
        <div className="max-w-40 truncate font-medium" title={value ?? undefined}>
          {value || "-"}
        </div>
      );
    },
  },
  {
    accessorKey: "lastModifiedOn",
    meta: { label: getColumnName("lastModifiedOn") },
    header: renderHeader("lastModifiedOn"),
    cell: ({ row }) => {
      const raw = row.getValue<string | null>("lastModifiedOn");
      const shortDate = formatDate(raw, false);
      const fullDate = formatDate(raw, true);
      if (!shortDate || shortDate === "01 Jan 0001") {
        return <div className="max-w-40 truncate font-mono tabular-nums">{FALLBACK_VALUE}</div>;
      }
      return (
        <div className="max-w-40 truncate font-mono tabular-nums" title={fullDate}>
          {shortDate}
        </div>
      );
    },
  },
  getRowActionsColumn<ApiKeyDto>({
    actions: ({ row }) => (
      <ApiKeyRowActions rowId={row.original.id} isRevoked={row.original.isRevoked} />
    ),
  }),
];

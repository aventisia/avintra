import { Checkbox } from "@avplatform/ui";
import { Badge } from "@avplatform/ui/badge";
import { FALLBACK_VALUE } from "@avplatform/ui/constants";
import { DTColumnHeader, DTOpenViewCell, createDTActionsColumn } from "@avplatform/ui/data-table";
import { formatDate } from "@avplatform/ui/utils";
import { ColumnDef } from "@tanstack/react-table";

import { TABLE_KEY } from "../constants";
import { getColumnName } from "../constants/column-display-names";
import type { ApiKeyPermissions } from "../dtos/api-key-permissions.dto";
import type { ApiKeyDto } from "../dtos/api-key.dto";
import { formatPermissions } from "../utils/api-key-permissions.util";
import { getApiKeyStatus } from "../utils/api-key-status.util";
import { ApiKeyRowActions } from "./api-key-row-actions/ApiKeyRowActions";

/**
 * Builds the array of table columns for the API keys table.
 */
export const getApiKeysTableColumns = (): ColumnDef<ApiKeyDto>[] => [
  {
    accessorKey: "selectRow",
    id: "selectRow",
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
    accessorKey: "name",
    header: ({ column }) => (
      <DTColumnHeader tableKey={TABLE_KEY} column={column} title={getColumnName("name")} />
    ),
    cell: ({ row }) => (
      <DTOpenViewCell rowId={row.original.id} cellContent={row.getValue("name")} entity="apiKey" />
    ),
  },
  {
    id: "status",
    accessorFn: (row) => `${row.isRevoked ? "Revoked" : (row.expiresAt ?? "Active")}`,
    size: 140,
    minSize: 120,
    header: ({ column }) => (
      <DTColumnHeader tableKey={TABLE_KEY} column={column} title={getColumnName("status")} />
    ),
    cell: ({ row }) => {
      const expiresAt = row.original.expiresAt;
      const isRevoked = row.original.isRevoked;
      const status = getApiKeyStatus(expiresAt, isRevoked);
      return <Badge variant={status.variant}>{status.label}</Badge>;
    },
  },
  {
    accessorKey: "keyPrefix",
    header: ({ column }) => (
      <DTColumnHeader tableKey={TABLE_KEY} column={column} title={getColumnName("keyPrefix")} />
    ),
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
    header: ({ column }) => (
      <DTColumnHeader tableKey={TABLE_KEY} column={column} title={getColumnName("expiresAt")} />
    ),
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
    header: ({ column }) => (
      <DTColumnHeader tableKey={TABLE_KEY} column={column} title={getColumnName("lastUsedAt")} />
    ),
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
    header: ({ column }) => (
      <DTColumnHeader tableKey={TABLE_KEY} column={column} title={getColumnName("permissions")} />
    ),
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
    header: ({ column }) => (
      <DTColumnHeader tableKey={TABLE_KEY} column={column} title={getColumnName("createdBy")} />
    ),
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
    header: ({ column }) => (
      <DTColumnHeader tableKey={TABLE_KEY} column={column} title={getColumnName("createdOn")} />
    ),
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
    header: ({ column }) => (
      <DTColumnHeader
        tableKey={TABLE_KEY}
        column={column}
        title={getColumnName("lastModifiedBy")}
      />
    ),
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
    header: ({ column }) => (
      <DTColumnHeader
        tableKey={TABLE_KEY}
        column={column}
        title={getColumnName("lastModifiedOn")}
      />
    ),
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
  createDTActionsColumn<ApiKeyDto>({
    renderCell: (row) => <ApiKeyRowActions rowId={row.id} isRevoked={row.isRevoked} />,
  }),
];

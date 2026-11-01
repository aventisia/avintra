import { Badge } from "@avplatform/ui/badge";
import { TableCNColumnHeader } from "@avplatform/ui/table-cn";
import { formatDate, getEnumValueByKey } from "@avplatform/ui/utils";
import { type ColumnDef } from "@tanstack/react-table";

import { getColumnName } from "@/features/02-configure/tools/constants/tools-column-display-names";
import { AUTHENTICATION_TYPE_DISPLAY_NAMES } from "@/features/02-configure/tools/constants/tools-display-names.constant";
import { ToolDto } from "@/features/02-configure/tools/dtos/index";
import { ComponentTypeEnum } from "@/features/02-configure/tools/enums/component-type-enum";
import { ToolAuthenticationTypeEnum } from "@/features/02-configure/tools/enums/tool-authentication-type-enum";

export const toolsTableColumns = (): ColumnDef<ToolDto>[] => [
  {
    accessorKey: "name",
    meta: { label: getColumnName("name") },
    header: ({ column }) => <TableCNColumnHeader column={column} label={getColumnName("name")} />,
    cell: ({ row }) => (
      <div className="flex max-w-80 items-center gap-3">
        <div className="w-auto truncate font-medium">{row.getValue("name")}</div>
        <span className="bg-muted border px-1 text-2xs leading-none h-[1.4rem] flex items-center justify-center text-ink-2 rounded-sm">
          {row.original.accessLevel?.replace(/([A-Z])/g, " $1")}
        </span>
      </div>
    ),
  },
  {
    accessorKey: "description",
    meta: { label: getColumnName("description") },
    header: ({ column }) => (
      <TableCNColumnHeader column={column} label={getColumnName("description")} />
    ),
    cell: ({ row }) => (
      <div className="truncate max-w-60 text-muted-foreground">
        {(row.getValue("description") as string) ?? "-"}
      </div>
    ),
  },
  {
    accessorKey: "type",
    meta: { label: getColumnName("type") },
    header: ({ column }) => <TableCNColumnHeader column={column} label={getColumnName("type")} />,
    cell: ({ row }) => <div>{getEnumValueByKey(ComponentTypeEnum, row.getValue("type"))}</div>,
  },
  {
    accessorKey: "baseUrl",
    meta: { label: getColumnName("baseUrl") },
    header: ({ column }) => (
      <TableCNColumnHeader column={column} label={getColumnName("baseUrl")} />
    ),
    cell: ({ row }) => (
      <div className="truncate max-w-60">{(row.getValue("baseUrl") as string) ?? "-"}</div>
    ),
  },
  {
    accessorKey: "authenticationType",
    meta: { label: getColumnName("authenticationType") },
    header: ({ column }) => (
      <TableCNColumnHeader column={column} label={getColumnName("authenticationType")} />
    ),
    cell: ({ row }) => {
      const value = row.getValue("authenticationType") as ToolAuthenticationTypeEnum | undefined;
      return <div>{(value && AUTHENTICATION_TYPE_DISPLAY_NAMES[value]) ?? "-"}</div>;
    },
  },
  {
    accessorKey: "isActive",
    meta: { label: getColumnName("isActive") },
    header: ({ column }) => (
      <TableCNColumnHeader column={column} label={getColumnName("isActive")} />
    ),
    cell: ({ row }) => (
      <Badge variant={row.getValue("isActive") ? "default" : "secondary"}>
        {row.getValue("isActive") ? "Active" : "Inactive"}
      </Badge>
    ),
  },
  {
    accessorKey: "isVerified",
    meta: { label: getColumnName("isVerified") },
    header: ({ column }) => (
      <TableCNColumnHeader column={column} label={getColumnName("isVerified")} />
    ),
    cell: ({ row }) => (
      <Badge variant={row.getValue("isVerified") ? "completed" : "draft"}>
        {row.getValue("isVerified") ? "Verified" : "Draft"}
      </Badge>
    ),
  },
  {
    accessorKey: "isTenantWideAccess",
    meta: { label: getColumnName("isTenantWideAccess") },
    header: ({ column }) => (
      <TableCNColumnHeader column={column} label={getColumnName("isTenantWideAccess")} />
    ),
    cell: ({ row }) => <div>{row.getValue("isTenantWideAccess") ? "Yes" : "No"}</div>,
  },
  {
    accessorKey: "createdOn",
    meta: { label: getColumnName("createdOn") },
    header: ({ column }) => (
      <TableCNColumnHeader column={column} label={getColumnName("createdOn")} />
    ),
    cell: ({ row }) => (
      <div className="font-mono tabular-nums">{formatDate(row.getValue("createdOn"))}</div>
    ),
  },
];

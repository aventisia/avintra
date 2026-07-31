import { Checkbox } from "@avplatform/ui";
import { Badge } from "@avplatform/ui/badge";
import { DTColumnHeader } from "@avplatform/ui/data-table";
import { formatDate, getEnumValueByKey } from "@avplatform/ui/utils";
import { type ColumnDef } from "@tanstack/react-table";

import { AUTHENTICATION_TYPE_DISPLAY_NAMES } from "@/features/02-configure/tools/constants/tools-display-names.constant";
import { getColumnName } from "@/features/02-configure/tools/constants/tools-column-display-names";
import { ToolDto } from "@/features/02-configure/tools/dtos/index";
import { ToolAuthenticationTypeEnum } from "@/features/02-configure/tools/enums/tool-authentication-type-enum";
import { ComponentTypeEnum } from "@/features/02-configure/tools/enums/component-type-enum";
import { ToolRowActions } from "@/features/02-configure/tools/components/tool-row-actions/ToolRowActions";

export const toolsTableColumns = (isShared: boolean, isLibrary: boolean): ColumnDef<ToolDto>[] => [
  {
    accessorKey: "id",
    header: ({ table }) => (
      <Checkbox
        checked={table.getIsAllPageRowsSelected()}
        onCheckedChange={(value) => table.toggleAllPageRowsSelected(!!value)}
      />
    ),
    cell: ({ row }) => (
      <Checkbox
        checked={row.getIsSelected()}
        onCheckedChange={(value) => row.toggleSelected(!!value)}
      />
    ),
    enableSorting: false,
  },
  {
    accessorKey: "name",
    header: ({ column }) => <DTColumnHeader column={column} tableKey="tools" title={getColumnName("name")} />,
    cell: ({ row }) => (
      <div className="flex max-w-80 items-center gap-3">
        <div className="w-auto truncate font-medium">{row.getValue("name")}</div>
        {isShared && (
          <span className="bg-muted border px-1 text-2xs leading-none h-[1.4rem] flex items-center justify-center text-primary rounded-full">
            {row.original.accessLevel?.replace(/([A-Z])/g, " $1")}
          </span>
        )}
      </div>
    ),
  },
  {
    accessorKey: "description",
    header: ({ column }) => <DTColumnHeader column={column} tableKey="tools" title={getColumnName("description")} />,
    cell: ({ row }) => <div className="truncate max-w-60 text-muted-foreground">{(row.getValue("description") as string) ?? "-"}</div>,
  },
  {
    accessorKey: "type",
    header: ({ column }) => <DTColumnHeader column={column} tableKey="tools" title={getColumnName("type")} />,
    cell: ({ row }) => <div>{getEnumValueByKey(ComponentTypeEnum, row.getValue("type"))}</div>,
  },
  {
    accessorKey: "baseUrl",
    header: ({ column }) => <DTColumnHeader column={column} tableKey="tools" title={getColumnName("baseUrl")} />,
    cell: ({ row }) => <div className="truncate max-w-60">{(row.getValue("baseUrl") as string) ?? "-"}</div>,
  },
  {
    accessorKey: "authenticationType",
    header: ({ column }) => <DTColumnHeader column={column} tableKey="tools" title={getColumnName("authenticationType")} />,
    cell: ({ row }) => {
      const value = row.getValue("authenticationType") as ToolAuthenticationTypeEnum | undefined;
      return <div>{(value && AUTHENTICATION_TYPE_DISPLAY_NAMES[value]) ?? "-"}</div>;
    },
  },
  {
    accessorKey: "isActive",
    header: ({ column }) => <DTColumnHeader column={column} tableKey="tools" title={getColumnName("isActive")} />,
    cell: ({ row }) => (
      <Badge variant={row.getValue("isActive") ? "default" : "secondary"}>
        {row.getValue("isActive") ? "Active" : "Inactive"}
      </Badge>
    ),
  },
  {
    accessorKey: "isVerified",
    header: ({ column }) => <DTColumnHeader column={column} tableKey="tools" title={getColumnName("isVerified")} />,
    cell: ({ row }) => (
      <Badge variant={row.getValue("isVerified") ? "default" : "outline"}>
        {row.getValue("isVerified") ? "Verified" : "Draft"}
      </Badge>
    ),
  },
  {
    accessorKey: "isTenantWideAccess",
    header: ({ column }) => <DTColumnHeader column={column} tableKey="tools" title={getColumnName("isTenantWideAccess")} />,
    cell: ({ row }) => <div>{row.getValue("isTenantWideAccess") ? "Yes" : "No"}</div>,
  },
  {
    accessorKey: "createdOn",
    header: ({ column }) => <DTColumnHeader column={column} tableKey="tools" title={getColumnName("createdOn")} />,
    cell: ({ row }) => <div>{formatDate(row.getValue("createdOn"))}</div>,
  },
  {
    id: "actions",
    cell: ({ row }) => (
      <ToolRowActions
        rowId={row.original.id ?? ""}
        name={row.original.name}
        accessLevel={row.original.accessLevel}
        isTenantWideAccess={row.original.isTenantWideAccess}
        isLibrary={isLibrary}
      />
    ),
  },
];

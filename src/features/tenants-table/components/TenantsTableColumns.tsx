import { DTColumnHeader } from "@/react-toolkit/data-table/components/DTColumnHeader";
import { ColumnDef } from "@tanstack/react-table";
import { formatDistanceToNow } from "date-fns";
import { TenantsTableDto } from "../dtos/tenants-table-dto";
import { TenantsTableRowActions } from "./TenantsTableRowActions";

/**
 * Array of table columns for the tenants table.
 * Each column object contains an accessorKey, header component, and cell component.
 */
export const tenantsTableColumns: ColumnDef<TenantsTableDto>[] = [
  {
    accessorKey: "name",
    header: ({ column }) => <DTColumnHeader column={column} title="Name" />,
    cell: ({ row }) => (
      <div className="w-auto truncate font-medium">{row.getValue("name")}</div>
    ),
  },
  {
    accessorKey: "expiresOn",
    header: ({ column }) => <DTColumnHeader column={column} title="Expires" />,
    cell: ({ row }) => (
      <div className="w-auto truncate font-medium">
        {formatDistanceToNow(row.getValue("expiresOn"), {
          addSuffix: true,
        })}
      </div>
    ),
  },
  {
    accessorKey: "createdBy",
    header: ({ column }) => (
      <DTColumnHeader column={column} title="Created By" />
    ),
    cell: ({ row }) => (
      <div className="w-auto truncate font-medium">
        {row.getValue("createdBy")}
      </div>
    ),
  },
  {
    accessorKey: "createdOn",
    header: ({ column }) => (
      <DTColumnHeader className="w-[7rem]" column={column} title="Created" />
    ),
    cell: ({ row }) => (
      <div className="w-auto truncate font-medium">
        {formatDistanceToNow(row.getValue("createdOn"), {
          addSuffix: true,
        })}
      </div>
    ),
  },
  {
    id: "actions",
    cell: ({ row }) => (
      // Render the tenants row actions component
      <TenantsTableRowActions rowId={row.original.id || "rowId"} />
    ),
  },
];

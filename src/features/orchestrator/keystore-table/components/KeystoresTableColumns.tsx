import { formatDistanceToNow } from "date-fns";

import { AccessLevelTypesEnum } from "@/react-toolkit/enums/access-level-types-enum";
import { KeyStoreTypesEnum } from "@/react-toolkit/enums/key-store-types-enum";
import { Checkbox } from "@/react-toolkit/ui/checkbox";
import { DTColumnHeader } from "@/react-toolkit/ui/data-table/DTColumnHeader";
import { getEnumValueByKey } from "@/react-toolkit/utils/enum-to-array";
import { ColumnDef } from "@tanstack/react-table";

import { getColumnName } from "../constants/column-display-names";
import { KeystoresTableDto } from "../dtos/keystores-table-dto";
import { KeystoreRowActions } from "./keystore-row-actions/KeystoreRowActions";

/**
 * Array of table columns for the keystores table.
 * Each column object contains an accessorKey, header component, and cell component.
 */
export const keystoresTableColumns: ColumnDef<KeystoresTableDto>[] = [
  {
    accessorKey: "id",
    header: ({ table }) => (
      <Checkbox
        checked={
          table.getIsAllPageRowsSelected() ||
          (table.getIsSomePageRowsSelected() && "indeterminate")
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
      <DTColumnHeader column={column} title={getColumnName("name")} />
    ),
    cell: ({ row }) => (
      <div className="w-auto truncate font-medium">{row.getValue("name")}</div>
    ),
  },
  {
    accessorKey: "type",
    header: ({ column }) => (
      <DTColumnHeader column={column} title={getColumnName("type")} />
    ),
    cell: ({ row }) => (
      <div className="w-auto truncate font-medium">
        {getEnumValueByKey(KeyStoreTypesEnum, row.getValue("type"))}
      </div>
    ),
  },
  {
    accessorKey: "accessLevel",
    header: ({ column }) => (
      <DTColumnHeader column={column} title={getColumnName("accessLevel")} />
    ),
    cell: ({ row }) => (
      <div className="w-auto truncate font-medium">
        {getEnumValueByKey(AccessLevelTypesEnum, row.getValue("accessLevel"))}
      </div>
    ),
  },
  {
    accessorKey: "isEncrypted",
    header: ({ column }) => (
      <DTColumnHeader column={column} title={getColumnName("isEncrypted")} />
    ),
    cell: ({ row }) => (
      <div className="w-auto truncate font-medium">
        {row.getValue("isEncrypted") ? "Yes" : "No"}
      </div>
    ),
  },
  {
    accessorKey: "createdBy",
    header: ({ column }) => (
      <DTColumnHeader column={column} title={getColumnName("createdBy")} />
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
      <DTColumnHeader
        className="w-[7rem]"
        column={column}
        title={getColumnName("createdOn")}
      />
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
      // Render the keystores row actions component
      <KeystoreRowActions rowId={row.original.id || "rowId"} />
    ),
  },
];

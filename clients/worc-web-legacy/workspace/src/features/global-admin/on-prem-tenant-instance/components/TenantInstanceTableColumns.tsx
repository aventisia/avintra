import { Checkbox } from "@aventisia/ui";
import { DTColumnHeader } from "@aventisia/ui/data-table";
import { getEnumValueByKey } from "@aventisia/ui/utils";
import { ColumnDef } from "@tanstack/react-table";
import { format } from "date-fns";

import { TABLE_KEY } from "../constants";
import { getColumnName } from "../constants/column-display-names";
import { OnPremInstanceDto } from "../dtos/tenant-instance-dto";
import { OnPremInstanceTypesEnum } from "../enums/tenant-instance-type-enum";

import { TenantInstanceRowAction } from "./tenant-instance-row-actions/TenantInstanceRowAction";
import { TenantInstanceLink } from "./TenantInstanceLink";

/**
 * Array of table columns for the on-prem tenants table.
 * Each column object contains an accessorKey, header component, and cell component.
 */
export const tenantInstanceTableColumns: ColumnDef<OnPremInstanceDto>[] = [
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
      <DTColumnHeader
        tableKey={TABLE_KEY}
        column={column}
        title={getColumnName("name")}
      />
    ),
    cell: ({ row }) => (
      <TenantInstanceLink
        rowId={row.original.id || "rowId"}
        cellValue={row.getValue("name")}
      />
    ),
  },
  {
    accessorKey: "type",
    header: ({ column }) => (
      <DTColumnHeader
        tableKey={TABLE_KEY}
        column={column}
        title={getColumnName("type")}
      />
    ),
    cell: ({ row }) => (
      <div className="w-auto truncate font-medium">
        {getEnumValueByKey(OnPremInstanceTypesEnum, row.getValue("type")) ??
          "--"}
      </div>
    ),
  },
  {
    accessorKey: "platformVersion",
    header: ({ column }) => (
      <DTColumnHeader
        tableKey={TABLE_KEY}
        column={column}
        title={getColumnName("platformVersion")}
      />
    ),
    cell: ({ row }) => (
      <div className="w-auto truncate font-medium">
        {row.getValue("platformVersion")
          ? "v" + row.getValue("platformVersion")
          : "--"}
      </div>
    ),
  },
  {
    accessorKey: "deployedOn",
    header: ({ column }) => (
      <DTColumnHeader
        tableKey={TABLE_KEY}
        column={column}
        title={getColumnName("deployedOn")}
      />
    ),
    cell: ({ row }) => (
      <div className="w-auto truncate font-medium">
        {row.getValue("deployedOn")
          ? format(row.getValue("deployedOn"), "dd MMM yyyy h:mm a")
          : "--"}
      </div>
    ),
  },
  {
    accessorKey: "lastValidatedOn",
    header: ({ column }) => (
      <DTColumnHeader
        tableKey={TABLE_KEY}
        column={column}
        title={getColumnName("lastValidatedOn")}
      />
    ),
    cell: ({ row }) => (
      <div className="w-auto truncate font-medium">
        {row.getValue("lastValidatedOn")
          ? format(row.getValue("lastValidatedOn"), "dd MMM yyyy h:mm a")
          : "--"}
      </div>
    ),
  },
  {
    accessorKey: "noOfInvalidCheck",
    header: ({ column }) => (
      <DTColumnHeader
        tableKey={TABLE_KEY}
        column={column}
        title={getColumnName("noOfInvalidCheck")}
      />
    ),
    cell: ({ row }) => (
      <div className="w-auto truncate font-medium">
        {row.getValue("noOfInvalidCheck")}
      </div>
    ),
  },
  {
    id: "actions",
    cell: ({ row }) => (
      // Render the tenant row actions component
      <TenantInstanceRowAction
        rowId={row.original.id || "rowId"}
        name={row.original.name}
      />
    ),
  },
];

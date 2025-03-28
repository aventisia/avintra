import { formatDistanceToNow, isValid } from "date-fns";

import { DTColumnHeader } from "@/react-toolkit/ui/data-table/DTColumnHeader";
import { ColumnDef } from "@tanstack/react-table";

import { getColumnName } from "../constants/column-display-names";
import { LicensesTableDto } from "../dtos/licenses-table-dto";
import { LicenseRowActions } from "./license-row-actions/LicenseRowActions";

/**
 * Array of table columns for the licenses table.
 * Each column object contains an accessorKey, header component, and cell component.
 */
export const licensesTableColumns: ColumnDef<LicensesTableDto>[] = [
  {
    accessorKey: "pricingComponent",
    header: ({ column }) => (
      <DTColumnHeader
        column={column}
        title={getColumnName("pricingComponent")}
      />
    ),
    cell: ({ row }) => (
      <div className="w-auto truncate font-medium">
        {row.getValue("pricingComponent")}
      </div>
    ),
  },
  {
    accessorKey: "unit",
    header: ({ column }) => (
      <DTColumnHeader column={column} title={getColumnName("unit")} />
    ),
    cell: ({ row }) => (
      <div className="w-auto truncate font-medium">{row.getValue("unit")}</div>
    ),
  },
  {
    accessorKey: "allocated",
    header: ({ column }) => (
      <DTColumnHeader column={column} title={getColumnName("allocated")} />
    ),
    cell: ({ row }) => (
      <div className="w-auto truncate font-medium">
        {row.getValue("allocated")}
      </div>
    ),
  },
  {
    accessorKey: "consumed",
    header: ({ column }) => (
      <DTColumnHeader column={column} title={getColumnName("consumed")} />
    ),
    cell: ({ row }) => (
      <div className="w-auto truncate font-medium">
        {row.getValue("consumed")}
      </div>
    ),
  },
  {
    accessorKey: "available",
    header: ({ column }) => (
      <DTColumnHeader column={column} title={getColumnName("available")} />
    ),
    cell: ({ row }) => (
      <div className="w-auto truncate font-medium">
        {row.getValue("available")}
      </div>
    ),
  },
  {
    accessorKey: "unitPrice",
    header: ({ column }) => (
      <DTColumnHeader column={column} title={getColumnName("unitPrice")} />
    ),
    cell: ({ row }) => (
      <div className="w-auto truncate font-medium">
        {row.getValue("unitPrice")}
      </div>
    ),
  },
  {
    accessorKey: "nextBillingDate",
    header: ({ column }) => (
      <DTColumnHeader
        className="w-[7rem]"
        column={column}
        title={getColumnName("nextBillingDate")}
      />
    ),
    cell: ({ row }) => (
      <div className="w-auto truncate font-medium">
        {!isValid(row.getValue<Date>("nextBillingDate"))
          ? "NA"
          : formatDistanceToNow(row.getValue<Date>("nextBillingDate"), {
              addSuffix: true,
            })}
      </div>
    ),
  },
  {
    accessorKey: "overdueBalance",
    header: ({ column }) => (
      <DTColumnHeader column={column} title={getColumnName("overdueBalance")} />
    ),
    cell: ({ row }) => (
      <div className="w-auto truncate font-medium">
        {row.getValue("overdueBalance")}
      </div>
    ),
  },
  {
    id: "actions",
    cell: ({ row }) => (
      // Render the licenses row actions component
      <LicenseRowActions rowId={row.original.id ?? "rowId"} />
    ),
  },
];

import { Checkbox } from "@aventisia/ui";
import { Badge } from "@aventisia/ui/badge";
import { DTColumnHeader } from "@aventisia/ui/data-table";
import { cn } from "@aventisia/ui/lib";
import { formatDate, getEnumValueByKey } from "@aventisia/ui/utils";
import { ColumnDef } from "@tanstack/react-table";

import { formatSecondsToCompactDuration } from "@/features/03-orchestrator/jobs-table/utils/format-time-utils";

import { TABLE_KEY } from "../constants";
import { getColumnName } from "../constants/column-display-names";
import { OnPremTenantDto } from "../dtos/on-prem-tenant-dto";
import { OnPremTenantTypes } from "../enums/on-prem-tenant-type-enum";
import { OnPremTenantInstanceLink } from "./OnPremTenantInstanceLink";
import { OnPremTenantRowAction } from "./on-prem-tenant-row-actions/OnPremTenantRowAction";

/**
 * Array of table columns for the on-prem tenants table.
 * Each column object contains an accessorKey, header component, and cell component.
 */
export const onPremTenantsTableColumns: ColumnDef<OnPremTenantDto>[] = [
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
      <OnPremTenantInstanceLink
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
        {getEnumValueByKey(OnPremTenantTypes, row.getValue("type"))}
      </div>
    ),
  },
  {
    accessorKey: "executionTimeAllowed",
    header: ({ column }) => (
      <DTColumnHeader
        tableKey={TABLE_KEY}
        column={column}
        title={getColumnName("executionTimeAllowed")}
      />
    ),
    cell: ({ row }) => (
      <div className="w-auto truncate font-medium">
        {formatSecondsToCompactDuration(row.getValue("executionTimeAllowed"))}
      </div>
    ),
  },
  {
    accessorKey: "consumedExecutionTime",
    header: ({ column }) => (
      <DTColumnHeader
        tableKey={TABLE_KEY}
        column={column}
        title={getColumnName("consumedExecutionTime")}
      />
    ),
    cell: ({ row }) => (
      <div className="w-auto truncate font-medium">
        {formatSecondsToCompactDuration(row.getValue("consumedExecutionTime"))}
      </div>
    ),
  },
  {
    accessorKey: "contractStartDate",
    header: ({ column }) => (
      <DTColumnHeader
        tableKey={TABLE_KEY}
        column={column}
        title={getColumnName("contractStartDate")}
      />
    ),
    cell: ({ row }) => (
      <div className="w-auto truncate font-medium">
        {formatDate(row.getValue("contractStartDate"))}
      </div>
    ),
  },
  {
    accessorKey: "contractRenewalDate",
    header: ({ column }) => (
      <DTColumnHeader
        tableKey={TABLE_KEY}
        column={column}
        title={getColumnName("contractRenewalDate")}
      />
    ),
    cell: ({ row }) => (
      <div className="w-auto truncate font-medium">
        {formatDate(row.getValue("contractRenewalDate"))}
      </div>
    ),
  },
  {
    accessorKey: "isAnyInstanceFailed",
    header: ({ column }) => (
      <DTColumnHeader
        tableKey={TABLE_KEY}
        column={column}
        title={getColumnName("isAnyInstanceFailed")}
      />
    ),
    cell: ({ row }) => {
      const isFailed = row.getValue("isAnyInstanceFailed");

      return (
        <Badge
          className={cn(
            isFailed == true
              ? "bg-red-200 text-red-600"
              : "bg-green-200 text-green-700",
          )}
        >
          {isFailed == true ? "Failed" : "Success"}
        </Badge>
      );
    },
  },

  {
    accessorKey: "createdByUser",
    header: ({ column }) => (
      <DTColumnHeader
        tableKey={TABLE_KEY}
        column={column}
        title={getColumnName("createdByUser")}
      />
    ),
    cell: ({ row }) => (
      <div className="w-auto truncate font-medium">
        {row.getValue("createdByUser")}
      </div>
    ),
  },
  {
    accessorKey: "createdOn",
    header: ({ column }) => (
      <DTColumnHeader
        tableKey={TABLE_KEY}
        column={column}
        title={getColumnName("createdOn")}
      />
    ),
    cell: ({ row }) => (
      <div className="w-auto truncate font-medium">
        {formatDate(row.getValue("createdOn"))}
      </div>
    ),
  },
  {
    id: "actions",
    cell: ({ row }) => (
      // Render the tenant row actions component
      <OnPremTenantRowAction
        rowId={row.original.id || "rowId"}
        name={row.original.name}
      />
    ),
  },
];

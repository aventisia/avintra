import { formatSecondsToCompactDuration } from "@/features/03-orchestrator/jobs-table/utils";

import { DTColumnHeader } from "@aventisia/ui/data-table";
import { getEnumValueByKey } from "@aventisia/ui/utils";
import { ColumnDef } from "@tanstack/react-table";
import { format } from "date-fns";

import { TABLE_KEY, formatNumber } from "../constants";
import { getColumnName } from "../constants/column-display-names";
import { OnPremInstanceDataDto } from "../dtos/tenant-instance-dto";
import { ValidationSourceTypesEnum } from "../enums/validation-source-type-enum";

/**
 * Array of table columns for the on-prem tenants table.
 * Each column object contains an accessorKey, header component, and cell component.
 */
export const instanceDataTableColumns: ColumnDef<OnPremInstanceDataDto>[] = [
  {
    accessorKey: "id",
    header: ({ column }) => (
      <DTColumnHeader tableKey={TABLE_KEY} column={column} title={"ID"} />
    ),
    cell: ({ row }) => (
      <div className="w-auto truncate font-medium">{row.getValue("id")}</div>
    ),
    enableSorting: false,
  },
  {
    accessorKey: "validatedOn",
    header: ({ column }) => (
      <DTColumnHeader
        tableKey={TABLE_KEY}
        column={column}
        title={getColumnName("validatedOn")}
      />
    ),
    cell: ({ row }) => (
      <div className="w-auto truncate font-medium">
        {row.getValue("validatedOn")
          ? format(row.getValue("validatedOn"), "dd MMM yyyy h:mm a")
          : "--"}
      </div>
    ),
  },
  {
    accessorKey: "validatedBy",
    header: ({ column }) => (
      <DTColumnHeader
        tableKey={TABLE_KEY}
        column={column}
        title={getColumnName("validatedBy")}
      />
    ),
    cell: ({ row }) => (
      <div className="w-auto truncate font-medium">
        {getEnumValueByKey(
          ValidationSourceTypesEnum,
          row.getValue("validatedBy"),
        )}
      </div>
    ),
  },
  {
    accessorKey: "executionTime",
    header: ({ column }) => (
      <DTColumnHeader
        tableKey={TABLE_KEY}
        column={column}
        title={getColumnName("executionTime")}
      />
    ),
    cell: ({ row }) => (
      <div className="w-auto truncate font-medium">
        {formatSecondsToCompactDuration(row.getValue("executionTime") || 0)}
      </div>
    ),
  },
  {
    accessorKey: "executedJobs",
    header: ({ column }) => (
      <DTColumnHeader
        tableKey={TABLE_KEY}
        column={column}
        title={getColumnName("executedJobs")}
      />
    ),
    cell: ({ row }) => (
      <div className="w-auto truncate font-medium">
        {formatNumber(row.getValue("executedJobs") || 0)}
      </div>
    ),
  },
  {
    accessorKey: "publishedAgents",
    header: ({ column }) => (
      <DTColumnHeader
        tableKey={TABLE_KEY}
        column={column}
        title={getColumnName("publishedAgents")}
      />
    ),
    cell: ({ row }) => (
      <div className="w-auto truncate font-medium">
        {formatNumber(row.getValue("publishedAgents") || 0)}
      </div>
    ),
  },
  {
    accessorKey: "users",
    header: ({ column }) => (
      <DTColumnHeader
        tableKey={TABLE_KEY}
        column={column}
        title={getColumnName("users")}
      />
    ),
    cell: ({ row }) => (
      <div className="w-auto truncate font-medium">
        {formatNumber(row.getValue("users") || 0)}
      </div>
    ),
  },
];

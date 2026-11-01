import { TableCNColumnHeader } from "@avplatform/ui/table-cn";
import { getEnumValueByKey } from "@avplatform/ui/utils";
import { ColumnDef, HeaderContext } from "@tanstack/react-table";
import { format } from "date-fns";

import { formatSecondsToCompactDuration } from "@/utils/format-time-utils.ee";

import { formatNumber } from "../constants";
import { getColumnName } from "../constants/column-display-names.ee";
import { OnPremInstanceDataDto } from "../dtos/tenant-instance-dto.ee";
import { ValidationSourceTypesEnum } from "../enums/validation-source-type-enum.ee";

const renderHeader =
  (columnKey: string) =>
  ({ column }: HeaderContext<OnPremInstanceDataDto, unknown>) => (
    <TableCNColumnHeader column={column} label={getColumnName(columnKey)} />
  );

/**
 * Array of table columns for the on-prem tenants table.
 * Each column object contains an accessorKey, header component, and cell component.
 */
export const instanceDataTableColumns: ColumnDef<OnPremInstanceDataDto>[] = [
  {
    accessorKey: "id",
    meta: { label: "ID" },
    header: ({ column }) => <TableCNColumnHeader column={column} label="ID" />,
    cell: ({ row }) => (
      <div className="font-mono tabular-nums w-auto truncate font-medium">{row.getValue("id")}</div>
    ),
    enableSorting: false,
  },
  {
    accessorKey: "validatedOn",
    meta: { label: getColumnName("validatedOn") },
    header: renderHeader("validatedOn"),
    cell: ({ row }) => (
      <div className="font-mono tabular-nums w-auto truncate font-medium">
        {row.getValue("validatedOn")
          ? format(row.getValue("validatedOn"), "dd MMM yyyy h:mm a")
          : "--"}
      </div>
    ),
  },
  {
    accessorKey: "validatedBy",
    meta: { label: getColumnName("validatedBy") },
    header: renderHeader("validatedBy"),
    cell: ({ row }) => (
      <div className="w-auto truncate font-medium">
        {getEnumValueByKey(ValidationSourceTypesEnum, row.getValue("validatedBy"))}
      </div>
    ),
  },
  {
    accessorKey: "executionTime",
    meta: { label: getColumnName("executionTime") },
    header: renderHeader("executionTime"),
    cell: ({ row }) => (
      <div className="font-mono tabular-nums w-auto truncate font-medium">
        {formatSecondsToCompactDuration(row.getValue("executionTime") || 0)}
      </div>
    ),
  },
  {
    accessorKey: "executedJobs",
    meta: { label: getColumnName("executedJobs") },
    header: renderHeader("executedJobs"),
    cell: ({ row }) => (
      <div className="font-mono tabular-nums w-auto truncate font-medium">
        {formatNumber(row.getValue("executedJobs") || 0)}
      </div>
    ),
  },
  {
    accessorKey: "publishedAgents",
    meta: { label: getColumnName("publishedAgents") },
    header: renderHeader("publishedAgents"),
    cell: ({ row }) => (
      <div className="font-mono tabular-nums w-auto truncate font-medium">
        {formatNumber(row.getValue("publishedAgents") || 0)}
      </div>
    ),
  },
  {
    accessorKey: "users",
    meta: { label: getColumnName("users") },
    header: renderHeader("users"),
    cell: ({ row }) => (
      <div className="font-mono tabular-nums w-auto truncate font-medium">
        {formatNumber(row.getValue("users") || 0)}
      </div>
    ),
  },
];

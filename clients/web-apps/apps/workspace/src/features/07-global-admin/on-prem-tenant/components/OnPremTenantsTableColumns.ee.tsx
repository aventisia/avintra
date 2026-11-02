import { Badge } from "@avplatform/ui/badge";
import { TableCNColumnHeader, getTableCNSelectColumn } from "@avplatform/ui/table-cn";
import { formatDate, getEnumValueByKey } from "@avplatform/ui/utils";
import { ColumnDef, HeaderContext } from "@tanstack/react-table";

import { formatSecondsToCompactDuration } from "@/features/03-orchestrator/jobs-table/utils/format-time-utils";
import { getRowActionsColumn } from "@/utils/get-row-actions-column.util";

import { getColumnName } from "../constants/column-display-names.ee";
import { OnPremTenantDto } from "../dtos/on-prem-tenant-dto.ee";
import { OnPremTenantTypes } from "../enums/on-prem-tenant-type-enum.ee";
import { OnPremTenantInstanceLink } from "./OnPremTenantInstanceLink.ee";
import { OnPremTenantRowAction } from "./on-prem-tenant-row-actions/OnPremTenantRowAction.ee";

const renderHeader =
  (columnKey: string) =>
  ({ column }: HeaderContext<OnPremTenantDto, unknown>) => (
    <TableCNColumnHeader column={column} label={getColumnName(columnKey)} />
  );

/**
 * Array of table columns for the on-prem tenants table.
 * Each column object contains an accessorKey, header component, and cell component.
 */
export const onPremTenantsTableColumns: ColumnDef<OnPremTenantDto>[] = [
  getTableCNSelectColumn<OnPremTenantDto>({
    enableHiding: true,
    meta: { label: getColumnName("select") },
  }),
  {
    accessorKey: "name",
    meta: { label: getColumnName("name") },
    header: renderHeader("name"),
    cell: ({ row }) => (
      <OnPremTenantInstanceLink
        rowId={row.original.id || "rowId"}
        cellValue={row.getValue("name")}
      />
    ),
  },
  {
    accessorKey: "type",
    meta: { label: getColumnName("type") },
    header: renderHeader("type"),
    cell: ({ row }) => (
      <div className="w-auto truncate font-medium">
        {getEnumValueByKey(OnPremTenantTypes, row.getValue("type"))}
      </div>
    ),
  },
  {
    accessorKey: "executionTimeAllowed",
    meta: { label: getColumnName("executionTimeAllowed") },
    header: renderHeader("executionTimeAllowed"),
    cell: ({ row }) => (
      <div className="font-mono tabular-nums w-auto truncate font-medium">
        {formatSecondsToCompactDuration(row.getValue("executionTimeAllowed"))}
      </div>
    ),
  },
  {
    accessorKey: "consumedExecutionTime",
    meta: { label: getColumnName("consumedExecutionTime") },
    header: renderHeader("consumedExecutionTime"),
    cell: ({ row }) => (
      <div className="font-mono tabular-nums w-auto truncate font-medium">
        {formatSecondsToCompactDuration(row.getValue("consumedExecutionTime"))}
      </div>
    ),
  },
  {
    accessorKey: "contractStartDate",
    meta: { label: getColumnName("contractStartDate") },
    header: renderHeader("contractStartDate"),
    cell: ({ row }) => (
      <div className="font-mono tabular-nums w-auto truncate font-medium">
        {formatDate(row.getValue("contractStartDate"))}
      </div>
    ),
  },
  {
    accessorKey: "contractRenewalDate",
    meta: { label: getColumnName("contractRenewalDate") },
    header: renderHeader("contractRenewalDate"),
    cell: ({ row }) => (
      <div className="font-mono tabular-nums w-auto truncate font-medium">
        {formatDate(row.getValue("contractRenewalDate"))}
      </div>
    ),
  },
  {
    accessorKey: "isAnyInstanceFailed",
    meta: { label: getColumnName("isAnyInstanceFailed") },
    header: renderHeader("isAnyInstanceFailed"),
    cell: ({ row }) => {
      const isFailed = row.getValue("isAnyInstanceFailed");

      return (
        <Badge variant={isFailed == true ? "failed" : "completed"}>
          {isFailed == true ? "Failed" : "Success"}
        </Badge>
      );
    },
  },

  {
    accessorKey: "createdByUser",
    meta: { label: getColumnName("createdByUser") },
    header: renderHeader("createdByUser"),
    cell: ({ row }) => (
      <div className="w-auto truncate font-medium">{row.getValue("createdByUser")}</div>
    ),
  },
  {
    accessorKey: "createdOn",
    meta: { label: getColumnName("createdOn") },
    header: renderHeader("createdOn"),
    cell: ({ row }) => (
      <div className="font-mono tabular-nums w-auto truncate font-medium">
        {formatDate(row.getValue("createdOn"))}
      </div>
    ),
  },
  getRowActionsColumn<OnPremTenantDto>({
    actions: ({ row }) => (
      <OnPremTenantRowAction rowId={row.original.id || "rowId"} name={row.original.name} />
    ),
  }),
];

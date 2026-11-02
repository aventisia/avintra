import { TableCNColumnHeader, getTableCNSelectColumn } from "@avplatform/ui/table-cn";
import { getEnumValueByKey } from "@avplatform/ui/utils";
import { ColumnDef, HeaderContext } from "@tanstack/react-table";
import { format } from "date-fns";

import { getRowActionsColumn } from "@/utils/get-row-actions-column.util";

import { getColumnName } from "../constants/column-display-names.ee";
import { OnPremInstanceDto } from "../dtos/tenant-instance-dto.ee";
import { OnPremInstanceTypesEnum } from "../enums/tenant-instance-type-enum.ee";
import { TenantInstanceLink } from "./TenantInstanceLink.ee";
import { TenantInstanceRowAction } from "./tenant-instance-row-actions/TenantInstanceRowAction.ee";

const renderHeader =
  (columnKey: string) =>
  ({ column }: HeaderContext<OnPremInstanceDto, unknown>) => (
    <TableCNColumnHeader column={column} label={getColumnName(columnKey)} />
  );

/**
 * Array of table columns for the on-prem tenants table.
 * Each column object contains an accessorKey, header component, and cell component.
 */
export const tenantInstanceTableColumns: ColumnDef<OnPremInstanceDto>[] = [
  getTableCNSelectColumn<OnPremInstanceDto>({
    enableHiding: true,
    meta: { label: getColumnName("select") },
  }),
  {
    accessorKey: "name",
    meta: { label: getColumnName("name") },
    header: renderHeader("name"),
    cell: ({ row }) => (
      <TenantInstanceLink rowId={row.original.id || "rowId"} cellValue={row.getValue("name")} />
    ),
  },
  {
    accessorKey: "type",
    meta: { label: getColumnName("type") },
    header: renderHeader("type"),
    cell: ({ row }) => (
      <div className="w-auto truncate font-medium">
        {getEnumValueByKey(OnPremInstanceTypesEnum, row.getValue("type")) ?? "--"}
      </div>
    ),
  },
  {
    accessorKey: "platformVersion",
    meta: { label: getColumnName("platformVersion") },
    header: renderHeader("platformVersion"),
    cell: ({ row }) => (
      <div className="font-mono tabular-nums w-auto truncate font-medium">
        {row.getValue("platformVersion") ? "v" + row.getValue("platformVersion") : "--"}
      </div>
    ),
  },
  {
    accessorKey: "deployedOn",
    meta: { label: getColumnName("deployedOn") },
    header: renderHeader("deployedOn"),
    cell: ({ row }) => (
      <div className="font-mono tabular-nums w-auto truncate font-medium">
        {row.getValue("deployedOn")
          ? format(row.getValue("deployedOn"), "dd MMM yyyy h:mm a")
          : "--"}
      </div>
    ),
  },
  {
    accessorKey: "lastValidatedOn",
    meta: { label: getColumnName("lastValidatedOn") },
    header: renderHeader("lastValidatedOn"),
    cell: ({ row }) => (
      <div className="font-mono tabular-nums w-auto truncate font-medium">
        {row.getValue("lastValidatedOn")
          ? format(row.getValue("lastValidatedOn"), "dd MMM yyyy h:mm a")
          : "--"}
      </div>
    ),
  },
  {
    accessorKey: "noOfInvalidCheck",
    meta: { label: getColumnName("noOfInvalidCheck") },
    header: renderHeader("noOfInvalidCheck"),
    cell: ({ row }) => (
      <div className="font-mono tabular-nums w-auto truncate font-medium">
        {row.getValue("noOfInvalidCheck")}
      </div>
    ),
  },
  getRowActionsColumn<OnPremInstanceDto>({
    actions: ({ row }) => (
      <TenantInstanceRowAction rowId={row.original.id || "rowId"} name={row.original.name} />
    ),
  }),
];

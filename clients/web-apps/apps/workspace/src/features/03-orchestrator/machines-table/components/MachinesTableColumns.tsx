import { CopyableText } from "@avplatform/ui";
import { Badge } from "@avplatform/ui/badge";
import { FALLBACK_VALUE } from "@avplatform/ui/constants";
import { CrudOpenViewCell } from "@avplatform/ui/crud-dialog";
import { TableCNColumnHeader, getTableCNSelectColumn } from "@avplatform/ui/table-cn";
import { formatDate } from "@avplatform/ui/utils";
import type { ColumnDef, HeaderContext } from "@tanstack/react-table";

import { getRowActionsColumn } from "@/utils/get-row-actions-column.util";

import { getColumnName, statusVariant } from "../constants/column-display-names";
import type { MachinesTableRowDto } from "../dtos/machines-table-row-dto";
import { MachineRowActions } from "./machine-row-actions/MachineRowActions";

const renderHeader =
  (columnKey: string) =>
  ({ column }: HeaderContext<MachinesTableRowDto, unknown>) => (
    <TableCNColumnHeader column={column} label={getColumnName(columnKey)} />
  );

/**
 * Array of table columns for the machine table.
 * Each column object contains an accessorKey, header component, and cell component.
 */
export const machinesTableColumns: ColumnDef<MachinesTableRowDto>[] = [
  getTableCNSelectColumn<MachinesTableRowDto>({
    enableHiding: true,
    meta: { label: getColumnName("select") },
  }),
  {
    accessorKey: "name",
    meta: { label: getColumnName("name") },
    header: renderHeader("name"),
    cell: ({ row }) => (
      <CrudOpenViewCell
        rowId={row.original.id}
        cellContent={row.getValue("name")}
        entity="machine"
      />
    ),
  },
  {
    accessorKey: "status",
    meta: { label: getColumnName("status") },
    header: renderHeader("status"),
    cell: ({ row }) => (
      <Badge variant={statusVariant[row.original.status]}>{row.getValue("status")}</Badge>
    ),
  },
  {
    accessorKey: "flowVersionCount",
    meta: { label: getColumnName("flowVersionCount") },
    header: renderHeader("flowVersionCount"),
    cell: ({ row }) => (
      <span className="font-mono tabular-nums">{row.getValue("flowVersionCount")}</span>
    ),
  },
  {
    accessorKey: "lastCheckedIn",
    meta: { label: getColumnName("lastCheckedIn") },
    header: ({ column }) => (
      <TableCNColumnHeader
        className="w-[7rem]"
        column={column}
        label={getColumnName("lastCheckedIn")}
      />
    ),
    cell: ({ row }) => {
      const formattedDate = formatDate(row.getValue("lastCheckedIn"), true);
      if (!formattedDate || formattedDate === "01 Jan 0001") return FALLBACK_VALUE;
      return (
        <span className="inline-block w-28 truncate font-mono tabular-nums" title={formattedDate}>
          {formattedDate}
        </span>
      );
    },
  },
  {
    accessorKey: "operatingSystem",
    meta: { label: getColumnName("operatingSystem") },
    header: renderHeader("operatingSystem"),
    cell: ({ row }) => row.getValue("operatingSystem"),
  },
  {
    accessorKey: "osID",
    meta: { label: getColumnName("osID") },
    header: renderHeader("osID"),
    cell: ({ row }) => (
      <CopyableText
        title={row.getValue("osID")}
        textClassName="w-auto max-w-32 truncate text-md font-mono"
        iconClassName="size-3"
        value={row.getValue("osID")}
      />
    ),
  },
  {
    accessorKey: "username",
    meta: { label: getColumnName("username") },
    header: renderHeader("username"),
    cell: ({ row }) => (
      <div title={row.getValue("username")} className="w-auto max-w-40 truncate font-medium">
        {row.getValue("username")}
      </div>
    ),
  },
  {
    accessorKey: "hostname",
    meta: { label: getColumnName("hostname") },
    header: renderHeader("hostname"),
    cell: ({ row }) => (
      <div title={row.getValue("hostname")} className="w-auto max-w-40 truncate font-medium">
        {row.getValue("hostname")}
      </div>
    ),
  },
  {
    accessorKey: "isDisabled",
    meta: { label: getColumnName("isDisabled") },
    header: renderHeader("isDisabled"),
    cell: ({ row }) => (row.getValue<boolean>("isDisabled") ? "Yes" : "No"),
  },
  {
    accessorKey: "linkedUserAccount",
    meta: { label: getColumnName("linkedUserAccount") },
    header: renderHeader("linkedUserAccount"),
    cell: ({ row }) => (
      <div
        title={row.getValue("linkedUserAccount")}
        className="w-auto max-w-40 truncate font-medium"
      >
        {row.getValue("linkedUserAccount")}
      </div>
    ),
  },
  {
    accessorKey: "createdAt",
    meta: { label: getColumnName("createdAt") },
    header: ({ column }) => (
      <TableCNColumnHeader
        className="w-[7rem]"
        column={column}
        label={getColumnName("createdAt")}
      />
    ),
    cell: ({ row }) => (
      <span className="font-mono tabular-nums">{formatDate(row.getValue("createdAt"))}</span>
    ),
  },
  {
    accessorKey: "id",
    meta: { label: getColumnName("id") },
    header: renderHeader("id"),
    cell: ({ row }) => (
      <CopyableText
        title={row.getValue("id")}
        textClassName="w-auto max-w-32 truncate text-md font-mono"
        iconClassName="size-3"
        value={row.getValue("id")}
      />
    ),
  },
  getRowActionsColumn<MachinesTableRowDto>({
    actions: ({ row }) => <MachineRowActions rowId={row.original.id ?? "rowId"} />,
  }),
];

import { Checkbox, CopyableText } from "@avplatform/ui";
import { Badge } from "@avplatform/ui/badge";
import { FALLBACK_VALUE } from "@avplatform/ui/constants";
import { DTColumnHeader, DTOpenViewCell, createDTActionsColumn } from "@avplatform/ui/data-table";
import { formatDate, maskIP } from "@avplatform/ui/utils";
import type { ColumnDef } from "@tanstack/react-table";

import { TABLE_KEY } from "../constants";
import { getColumnName, statusColor } from "../constants/column-display-names";
import type { MachinesTableRowDto } from "../dtos/machines-table-row-dto";
import { MachineRowActions } from "./machine-row-actions/MachineRowActions";

const formatDateValue = (value: unknown) => {
  if (!value) return null;
  const date = value instanceof Date ? value : new Date(String(value));
  return Number.isNaN(date.getTime()) ? null : formatDate(date);
};

/**
 * Array of table columns for the machine table.
 * Each column object contains an accessorKey, header component, and cell component.
 */
export const machinesTableColumns: ColumnDef<MachinesTableRowDto>[] = [
  {
    accessorKey: "selectRow",
    header: ({ table }) => (
      <Checkbox
        checked={
          table.getIsAllPageRowsSelected() || (table.getIsSomePageRowsSelected() && "indeterminate")
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
      <DTColumnHeader tableKey={TABLE_KEY} column={column} title={getColumnName("name")} />
    ),
    cell: ({ row }) => (
      <DTOpenViewCell rowId={row.original.id} cellContent={row.getValue("name")} entity="machine" />
    ),
  },
  {
    accessorKey: "status",
    header: ({ column }) => (
      <DTColumnHeader tableKey={TABLE_KEY} column={column} title={getColumnName("status")} />
    ),
    cell: ({ row }) => (
      <Badge className={statusColor[row.original.status]}>{row.getValue("status")}</Badge>
    ),
  },
  {
    accessorKey: "flowVersionCount",
    header: ({ column }) => (
      <DTColumnHeader
        tableKey={TABLE_KEY}
        column={column}
        title={getColumnName("flowVersionCount")}
      />
    ),
    cell: ({ row }) => row.getValue("flowVersionCount"),
  },
  {
    accessorKey: "lastCheckedIn",
    header: ({ column }) => (
      <DTColumnHeader
        tableKey={TABLE_KEY}
        className="w-[7rem]"
        column={column}
        title={getColumnName("lastCheckedIn")}
      />
    ),
    cell: ({ row }) => {
      const formattedDate = formatDateValue(row.getValue("lastCheckedIn"));
      if (!formattedDate || formattedDate === "01 Jan 0001") return FALLBACK_VALUE;
      return formattedDate;
    },
  },
  {
    accessorKey: "environment",
    header: ({ column }) => (
      <DTColumnHeader tableKey={TABLE_KEY} column={column} title={getColumnName("environment")} />
    ),
    cell: ({ row }) => row.getValue("environment"),
  },
  {
    accessorKey: "operatingSystem",
    header: ({ column }) => (
      <DTColumnHeader
        tableKey={TABLE_KEY}
        column={column}
        title={getColumnName("operatingSystem")}
      />
    ),
    cell: ({ row }) => row.getValue("operatingSystem"),
  },
  {
    accessorKey: "osID",
    header: ({ column }) => (
      <DTColumnHeader tableKey={TABLE_KEY} column={column} title={getColumnName("osID")} />
    ),
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
    header: ({ column }) => (
      <DTColumnHeader tableKey={TABLE_KEY} column={column} title={getColumnName("username")} />
    ),
    cell: ({ row }) => (
      <div title={row.getValue("username")} className="w-auto max-w-40 truncate font-medium">
        {row.getValue("username")}
      </div>
    ),
  },
  {
    accessorKey: "hostname",
    header: ({ column }) => (
      <DTColumnHeader tableKey={TABLE_KEY} column={column} title={getColumnName("hostname")} />
    ),
    cell: ({ row }) => (
      <div title={row.getValue("hostname")} className="w-auto max-w-40 truncate font-medium">
        {row.getValue("hostname")}
      </div>
    ),
  },
  {
    accessorKey: "isDisabled",
    header: ({ column }) => (
      <DTColumnHeader tableKey={TABLE_KEY} column={column} title={getColumnName("isDisabled")} />
    ),
    cell: ({ row }) => (row.getValue<boolean>("isDisabled") ? "Yes" : "No"),
  },
  {
    accessorKey: "ipAddress",
    header: ({ column }) => (
      <DTColumnHeader tableKey={TABLE_KEY} column={column} title={getColumnName("ipAddress")} />
    ),
    cell: ({ row }) => {
      const ipAddress = row.getValue<string>("ipAddress");
      if (!ipAddress || ipAddress === "0.0.0.0") return FALLBACK_VALUE;
      return maskIP(ipAddress);
    },
  },
  {
    accessorKey: "createdBy",
    header: ({ column }) => (
      <DTColumnHeader tableKey={TABLE_KEY} column={column} title={getColumnName("createdBy")} />
    ),
    cell: ({ row }) => (
      <div title={row.getValue("createdBy")} className="w-auto max-w-40 truncate font-medium">
        {row.getValue("createdBy")}
      </div>
    ),
  },
  {
    accessorKey: "createdOn",
    header: ({ column }) => (
      <DTColumnHeader
        tableKey={TABLE_KEY}
        className="w-[7rem]"
        column={column}
        title={getColumnName("createdOn")}
      />
    ),
    cell: ({ row }) => formatDateValue(row.getValue("createdOn")),
  },
  {
    accessorKey: "lastModifiedBy",
    header: ({ column }) => (
      <DTColumnHeader
        tableKey={TABLE_KEY}
        column={column}
        title={getColumnName("lastModifiedBy")}
      />
    ),
    cell: ({ row }) => (
      <div title={row.getValue("lastModifiedBy")} className="w-auto max-w-40 truncate font-medium">
        {row.getValue("lastModifiedBy")}
      </div>
    ),
  },
  {
    accessorKey: "lastModifiedOn",
    header: ({ column }) => (
      <DTColumnHeader
        tableKey={TABLE_KEY}
        className="w-[7rem]"
        column={column}
        title={getColumnName("lastModifiedOn")}
      />
    ),
    cell: ({ row }) => formatDateValue(row.getValue("lastModifiedOn")),
  },
  {
    accessorKey: "id",
    header: ({ column }) => (
      <DTColumnHeader tableKey={TABLE_KEY} column={column} title={getColumnName("id")} />
    ),
    cell: ({ row }) => (
      <CopyableText
        title={row.getValue("id")}
        textClassName="w-auto max-w-32 truncate text-md font-mono"
        iconClassName="size-3"
        value={row.getValue("id")}
      />
    ),
  },
  createDTActionsColumn<MachinesTableRowDto>({
    renderCell: (row) => <MachineRowActions rowId={row.id ?? "rowId"} />,
  }),
];

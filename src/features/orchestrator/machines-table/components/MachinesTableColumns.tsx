import { Badge } from "@/react-toolkit/ui/badge";
import { Checkbox } from "@/react-toolkit/ui/checkbox";
import { DTColumnHeader } from "@/react-toolkit/ui/data-table/DTColumnHeader";
import {
  dateFormater,
  dateFormaterDistanceToNow,
} from "@/react-toolkit/utils/date-formater";

import { ColumnDef } from "@tanstack/react-table";

import { maskIP } from "../constants";
import { getColumnName, statusColor } from "../constants/column-display-names";
import { MachinesTableDto } from "../dtos/machines-table-dto";
import { MachineRowActions } from "./machine-row-actions/MachineRowActions";

/**
 * Array of table columns for the machine table.
 * Each column object contains an accessorKey, header component, and cell component.
 */
export const machinesTableColumns: ColumnDef<MachinesTableDto>[] = [
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
      <div className="w-auto max-w-60 truncate font-medium">
        {row.getValue("name")}
      </div>
    ),
  },

  {
    accessorKey: "agentCount",
    header: ({ column }) => (
      <DTColumnHeader column={column} title={getColumnName("agentCount")} />
    ),
    cell: ({ row }) => row.getValue("agentCount"),
  },

  {
    accessorKey: "environment",
    header: ({ column }) => (
      <DTColumnHeader column={column} title={getColumnName("environment")} />
    ),
    cell: ({ row }) => (
      <div className="w-auto truncate font-medium">
        {row.getValue("environment")}
      </div>
    ),
  },

  {
    accessorKey: "type",
    header: ({ column }) => (
      <DTColumnHeader column={column} title={getColumnName("type")} />
    ),
    cell: ({ row }) => (
      <div className="w-auto truncate font-medium">{row.getValue("type")}</div>
    ),
  },

  {
    accessorKey: "status",
    header: ({ column }) => (
      <DTColumnHeader column={column} title={getColumnName("status")} />
    ),
    cell: ({ row }) => (
      <Badge className={statusColor[row.original.status]}>
        {row.getValue("status")}
      </Badge>
    ),
  },

  {
    accessorKey: "lastCheckedIn",
    header: ({ column }) => (
      <DTColumnHeader
        className="w-[7rem]"
        column={column}
        title={getColumnName("lastCheckedIn")}
      />
    ),
    cell: ({ row }) => (
      <div className="w-auto truncate font-medium">
        {dateFormaterDistanceToNow(row.getValue<Date>("lastCheckedIn"))}
      </div>
    ),
  },

  {
    accessorKey: "ipAddress",
    header: ({ column }) => (
      <DTColumnHeader column={column} title={getColumnName("ipAddress")} />
    ),
    cell: ({ row }) => (
      <div className="w-auto truncate font-medium">
        {maskIP(row.getValue("ipAddress"))}
      </div>
    ),
  },

  {
    accessorKey: "hostname",
    header: ({ column }) => (
      <DTColumnHeader column={column} title={getColumnName("hostname")} />
    ),
    cell: ({ row }) => (
      <div className="w-auto truncate font-medium">
        {row.getValue<string>("hostname")}
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
        {dateFormater(row.getValue<Date>("createdOn"))}
      </div>
    ),
  },
  {
    id: "actions",
    cell: ({ row }) => (
      // Render the machines row actions component
      <MachineRowActions rowId={row.original.id ?? "rowId"} />
    ),
  },
];

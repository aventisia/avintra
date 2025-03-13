import { Checkbox } from "@/react-toolkit/ui/checkbox";
import { DTColumnHeader } from "@/react-toolkit/ui/data-table/DTColumnHeader";
import { ColumnDef } from "@tanstack/react-table";
import { format, formatDistanceToNow } from "date-fns";
import { getColumnName, statusColor } from "../constants/column-display-names";
import { MachinesTableDto } from "../dtos/machines-table-dto";
import { MachineRowActions } from "./machine-row-actions/MachineRowActions";
import { Badge } from "@/react-toolkit/ui/badge";

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
        {format(
          row.getValue("lastCheckedIn") ?? new Date(),
          "dd MMM yyyy, HH:mm",
        )}
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
        {row.getValue("ipAddress")}
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
        {row.getValue("hostname")}
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
        {formatDistanceToNow(row.getValue("createdOn") ?? new Date(), {
          addSuffix: true,
        })}
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

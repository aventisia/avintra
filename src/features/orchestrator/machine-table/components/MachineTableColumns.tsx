import { Checkbox } from "@/react-toolkit/ui/checkbox";
import { DTColumnHeader } from "@/react-toolkit/ui/data-table/DTColumnHeader";
import { ColumnDef } from "@tanstack/react-table";
import { formatDistanceToNow } from "date-fns";
import { getColumnName } from "../constants/column-display-names";
import { MachineDto } from "../dtos/machine-dto";
import { MachineTableCellLink } from "./MachineTableCellLink";
import { MachineRowActions } from "./machine-row-actions/MachineRowActions";

/**
 * Array of table columns for the machine table.
 * Each column object contains an accessorKey, header component, and cell component.
 */
export const MachineTableColumns: ColumnDef<MachineDto>[] = [
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
      <MachineTableCellLink
        rowId={row.original.id ?? "rowId"}
        cellValue={row.getValue("name")}
      />
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
    accessorKey: "type",
    header: ({ column }) => (
      <DTColumnHeader column={column} title={getColumnName("type")} />
    ),
    cell: ({ row }) => (
      <div className="w-auto truncate font-medium">{row.getValue("type")}</div>
    ),
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
    accessorKey: "status",
    header: ({ column }) => (
      <DTColumnHeader column={column} title={getColumnName("status")} />
    ),
    cell: ({ row }) => row.getValue("status"),
  },
  {
    accessorKey: "agentCount",
    header: ({ column }) => (
      <DTColumnHeader column={column} title={getColumnName("agentCount")} />
    ),
    cell: ({ row }) => row.getValue("agentCount"),
  },
  {
    accessorKey: "isAvailable",
    header: ({ column }) => (
      <DTColumnHeader column={column} title={getColumnName("isAvailable")} />
    ),
    cell: ({ row }) => (
      <div className="w-auto truncate font-medium">
        {row.getValue("isAvailable")}
      </div>
    ),
  },
  {
    accessorKey: "lastCheckedIn",
    header: ({ column }) => (
      <DTColumnHeader
        className="w-[7rem]"
        column={column}
        title={getColumnName("Last Checked In")}
      />
    ),
    cell: ({ row }) => (
      <div className="w-auto truncate font-medium">
        {formatDistanceToNow(row.getValue("lastCheckedIn"), {
          addSuffix: true,
        })}
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
        {formatDistanceToNow(row.getValue("createdOn"), {
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

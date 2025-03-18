import { Checkbox } from "@/react-toolkit/ui/checkbox";
import { DTColumnHeader } from "@/react-toolkit/ui/data-table/DTColumnHeader";
import { ColumnDef } from "@tanstack/react-table";
import { formatDistanceToNow } from "date-fns";
import { AgentsTableDto } from "../dtos/agents-table-dto";
import { DTRowAction } from "@/react-toolkit/ui/data-table/row-actions/DTRowAction";
import { DataTableRowActions } from "@/react-toolkit/ui/data-table/row-actions/DataTableRowActions";
import { getColumnName } from "../constants/column-display-names";
import { AgentRowDeleteAction } from "./AgentRowDeleteAction";
import { Separator } from "@/react-toolkit/ui/separator";
import { AssignMachineRowAction } from "./AssignMachineRowAction";

/**
 * Array of table columns for the agents table.
 * Each column object contains an accessorKey, header component, and cell component.
 */
export const agentsTableColumns: ColumnDef<AgentsTableDto>[] = [
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
      <div className="w-auto truncate font-medium">{row.getValue("name")}</div>
    ),
  },

  {
    accessorKey: "machineCount",
    header: ({ column }) => (
      <DTColumnHeader column={column} title={getColumnName("machineCount")} />
    ),
    cell: ({ row }) => (
      <div className="w-auto truncate font-medium">
        {row.getValue("machineCount")}
      </div>
    ),
  },

  {
    accessorKey: "isLocked",
    header: ({ column }) => (
      <DTColumnHeader column={column} title={getColumnName("isLocked")} />
    ),
    cell: ({ row }) => (
      <div className="w-auto truncate font-medium">
        {row.getValue("isLocked") ? "Yes" : "No"}
      </div>
    ),
  },
  {
    accessorKey: "versionNumber",
    header: ({ column }) => (
      <DTColumnHeader column={column} title={getColumnName("versionNumber")} />
    ),
    cell: ({ row }) => (
      <div className="w-auto truncate font-medium">
        {"v" + row.getValue("versionNumber")}
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
        {!row.getValue("createdOn")
          ? "NA"
          : formatDistanceToNow(row.getValue("createdOn"), {
              addSuffix: true,
            })}
      </div>
    ),
  },
  {
    id: "actions",
    cell: ({ row }) => (
      // Render the agents row actions component
      <DataTableRowActions>
        <DTRowAction rowId={row.original.id || "rowId"} crudAction="read" />
        <AssignMachineRowAction rowId={row.original.id || "rowId"} />
        <Separator />
        <AgentRowDeleteAction rowId={row.original.id || "rowId"} />
      </DataTableRowActions>
    ),
  },
];

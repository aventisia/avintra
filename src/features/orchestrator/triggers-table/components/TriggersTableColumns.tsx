import { Checkbox } from "@aventisia/ui";
import { DTColumnHeader } from "@aventisia/ui/data-table";
import { ColumnDef } from "@tanstack/react-table";

import { getColumnName } from "../constants/column-display-names";
import { TriggersTableDto } from "../dtos/triggers-table-dto";

import { TriggerRowActions } from "./table-actions/TriggerRowActions";

/**
 * Array of table columns for the triggers table.
 * Each column object contains an accessorKey, header component, and cell component.
 */
export const triggersTableColumns: ColumnDef<TriggersTableDto>[] = [
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
    accessorKey: "jobPriority",
    header: ({ column }) => (
      <DTColumnHeader
        column={column}
        title={getColumnName("jobPriority") ?? 0}
      />
    ),
    cell: ({ row }) => (
      <div className="w-auto truncate font-medium">
        {row.getValue("jobPriority") ?? 0}
      </div>
    ),
  },

  {
    accessorKey: "nextRunTime",
    header: ({ column }) => (
      <DTColumnHeader column={column} title={getColumnName("nextRunTime")} />
    ),
    cell: ({ row }) => (
      <div className="w-auto truncate font-medium">
        {row.getValue("nextRunTime") ?? 0}
      </div>
    ),
  },

  {
    accessorKey: "stopAfter",
    header: ({ column }) => (
      <DTColumnHeader column={column} title={getColumnName("stopAfter") ?? 0} />
    ),
    cell: ({ row }) => (
      <div className="w-auto truncate font-medium">
        {row.getValue("stopAfter") ?? 0}
      </div>
    ),
  },

  {
    id: "actions",
    cell: ({ row }) => (
      // Render the triggers row actions component
      <TriggerRowActions rowId={row.original.id ?? "rowId"} />
    ),
  },
];

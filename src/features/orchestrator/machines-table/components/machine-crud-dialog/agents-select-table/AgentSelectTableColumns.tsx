import { Checkbox } from "@/react-toolkit/ui/checkbox";
import { DTColumnHeader } from "@/react-toolkit/ui/data-table/DTColumnHeader";
import { ColumnDef } from "@tanstack/react-table";
import { SelectAgentTableDto } from "../../../dtos/select-agent-table-dto";

/**
 * Array of table columns for the machine table.
 * Each column object contains an accessorKey, header component, and cell component.
 */
export const agentSelectTableColumns: ColumnDef<SelectAgentTableDto>[] = [
  {
    accessorKey: "id",
    header: ({ column, table }) => (
      <div className="flex w-auto max-w-20 gap-5 truncate !px-0 align-middle font-medium">
        <Checkbox
          checked={
            table.getIsAllPageRowsSelected() ||
            (table.getIsSomePageRowsSelected() && "indeterminate")
          }
          onCheckedChange={(value) => table.toggleAllPageRowsSelected(!!value)}
          aria-label="Select all"
          className="mt-2 translate-y-[2px] !px-0"
        />
        <DTColumnHeader className="m-0 !px-0" column={column} title="Name" />
      </div>
    ),
    cell: ({ row }) => (
      <div className="flex gap-5 truncate !px-0 font-medium">
        <Checkbox
          checked={row.getIsSelected()}
          onCheckedChange={(value) => {
            row.toggleSelected(!!value);
          }}
          aria-label="Select row"
          className="translate-y-[2px] !px-0"
        />
        {row.original.name}
      </div>
    ),
  },

  {
    accessorKey: "name",
    header: ({ column }) => (
      <DTColumnHeader className="!px-0" column={column} title="Name" />
    ),
    cell: ({ row }) => (
      <div className="w-auto max-w-10 truncate !px-0 font-medium">
        v{row.getValue("name")}
      </div>
    ),
  },

  {
    accessorKey: "versionNumber",
    header: ({ column }) => (
      <DTColumnHeader className="!px-0" column={column} title="Version" />
    ),
    cell: ({ row }) => (
      <div className="w-auto max-w-10 truncate !px-0 font-medium">
        v{row.getValue("versionNumber")}
      </div>
    ),
  },

  {
    accessorKey: "isAssigned",
    header: ({ column }) => (
      <DTColumnHeader className="!px-0" column={column} title="isAssigned" />
    ),
    cell: ({ row }) => (
      <div className="w-auto max-w-10 truncate !px-0 font-medium">
        v{row.getValue("isAssigned")}
      </div>
    ),
  },
];

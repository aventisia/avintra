import { Checkbox } from "@/react-toolkit/ui/checkbox";
import { DTColumnHeader } from "@/react-toolkit/ui/data-table/DTColumnHeader";
import { ColumnDef } from "@tanstack/react-table";
import { AssignMachineDto } from "../../../dtos/assign-machine-dto";

/**
 * Array of table columns for the machine table.
 * Each column object contains an accessorKey, header component, and cell component.
 */
export const machineSelectTableColumns: ColumnDef<AssignMachineDto>[] = [
  {
    accessorKey: "id",
    header: ({ column, table }) => (
      <div className="flex w-auto max-w-20 gap-5 truncate align-middle font-medium">
        <Checkbox
          checked={
            table.getIsAllPageRowsSelected() ||
            (table.getIsSomePageRowsSelected() && "indeterminate")
          }
          onCheckedChange={(value) => table.toggleAllPageRowsSelected(!!value)}
          aria-label="Select all"
          className="mt-2 translate-y-[2px]"
        />
        <DTColumnHeader className="m-0" column={column} title="Name" />
      </div>
    ),
    cell: ({ row }) => (
      <div className="flex gap-5 truncate font-medium">
        <Checkbox
          checked={row.getIsSelected()}
          onCheckedChange={(value) => {
            row.toggleSelected(!!value);
          }}
          aria-label="Select row"
          className="translate-y-[2px]"
        />
        {row.original.name}
      </div>
    ),
  },

  {
    accessorKey: "name",
    header: ({ column }) => <DTColumnHeader column={column} title="Name" />,
    cell: ({ row }) => (
      <div className="w-auto truncate">{row.getValue("name")}</div>
    ),
  },

  {
    accessorKey: "createdBy",
    header: ({ column }) => <DTColumnHeader column={column} title="Added By" />,
    cell: ({ row }) => (
      <div className="w-auto truncate">{row.getValue("createdBy")}</div>
    ),
  },

  {
    accessorKey: "isAssigned",
    header: ({ column }) => (
      <DTColumnHeader column={column} title="isAssigned" />
    ),
    cell: ({ row }) => (
      <div className="w-auto max-w-10 truncate font-medium">
        v{row.getValue("isAssigned")}
      </div>
    ),
  },
];

import { Checkbox } from "@/react-toolkit/ui/checkbox";
import { DTColumnHeader } from "@/react-toolkit/ui/data-table/DTColumnHeader";
import { ColumnDef } from "@tanstack/react-table";
import { SelectOptionDto } from "@/react-toolkit/dtos/response/select-option-dto";
import { MachineAssignAgentTableCellLink } from "./MachineAssignAgentTableCellLink";
import { AssignAgentTableRowActions } from "./AssignAgentTableRowActions";

/**
 * Array of table columns for the agents list to assign to machine.
 * Each column object contains an accessorKey, header component, and cell component.
 */
export const AssignAgentTableColumns: ColumnDef<SelectOptionDto>[] = [
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
    accessorKey: "label",
    header: ({ column }) => <DTColumnHeader column={column} title="Name" />,
    cell: ({ row }) => (
      <MachineAssignAgentTableCellLink
        rowId={row.original.value ?? "rowId"}
        cellValue={row.getValue("label")}
        description={row.original.description}
      />
    ),
  },
  {
    id: "actions",
    cell: ({ row }) => (
      // Render the machines row actions component
      <AssignAgentTableRowActions value={row.original.value ?? "rowId"} />
    ),
  },
];

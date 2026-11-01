import { ColumnDef } from "@tanstack/react-table";

import { AssignMachineDto } from "../../../dtos/assign-machine-dto";
import { AssignAllMachineCheckBox } from "./AssignAllMachineCheckBox";
import { AssignMachineCheckBox } from "./AssignMachineCheckBox";

/**
 * Array of table columns for the machine table.
 * Each column object contains an accessorKey, header component, and cell component.
 */
export const machineSelectTableColumns: ColumnDef<AssignMachineDto>[] = [
  {
    accessorKey: "id",
    header: ({ column, table }) => <AssignAllMachineCheckBox table={table} column={column} />,
    cell: ({ row }) => <AssignMachineCheckBox row={row} />,
    enableSorting: false,
    enableHiding: false,
  },
];

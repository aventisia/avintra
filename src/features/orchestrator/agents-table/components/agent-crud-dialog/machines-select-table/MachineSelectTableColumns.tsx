import { DTColumnHeader } from "@/react-toolkit/ui/data-table/DTColumnHeader";
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
    header: ({ column, table }) => (
      <AssignAllMachineCheckBox table={table} column={column} />
    ),
    cell: ({ row }) => <AssignMachineCheckBox row={row} />,
  },

  {
    accessorKey: "name",
    header: ({ column }) => <DTColumnHeader column={column} title="Name" />,
    cell: ({ row }) => (
      <div className="!w-2 text-ellipsis truncate">{row.getValue("name")}</div>
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
    cell: ({ row }) => {
      return (
        <div className="w-auto max-w-10 truncate font-medium">
          v{row.getValue("isAssigned")}
        </div>
      );
    },
  },
];

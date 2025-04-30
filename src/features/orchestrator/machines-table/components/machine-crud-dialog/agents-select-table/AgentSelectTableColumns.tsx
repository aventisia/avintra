import { DTColumnHeader } from "@aventisia/ui/data-table";
import { ColumnDef } from "@tanstack/react-table";

import { SelectAgentTableDto } from "../../../dtos/select-agent-table-dto";
import { AssignAgentCheckBox } from "./AssignAgentCheckBox";
import { AssignAllAgentCheckBox } from "./AssignAllAgentCheckBox";

/**
 * Array of table columns for the machine table.
 * Each column object contains an accessorKey, header component, and cell component.
 */
export const agentSelectTableColumns: ColumnDef<SelectAgentTableDto>[] = [
  {
    accessorKey: "id",
    header: ({ column, table }) => (
      <AssignAllAgentCheckBox table={table} column={column} />
    ),
    cell: ({ row }) => <AssignAgentCheckBox row={row} />,
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

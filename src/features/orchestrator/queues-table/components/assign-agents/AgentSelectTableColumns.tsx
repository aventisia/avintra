import { ColumnDef } from "@tanstack/react-table";

import { QueueAgentsDto } from "../../dtos/queue-agents-dto";

import { AssignAgentCheckBox } from "./AssignAgentCheckBox";
import { AssignAllAgentCheckBox } from "./AssignAllAgentCheckBox";

/**
 * Array of table columns for the machine table.
 * Each column object contains an accessorKey, header component, and cell component.
 */
export const agentSelectTableColumns: ColumnDef<QueueAgentsDto>[] = [
  {
    accessorKey: "id",
    header: ({ column, table }) => (
      <AssignAllAgentCheckBox table={table} column={column} />
    ),
    cell: ({ row }) => <AssignAgentCheckBox row={row} />,
  },
];

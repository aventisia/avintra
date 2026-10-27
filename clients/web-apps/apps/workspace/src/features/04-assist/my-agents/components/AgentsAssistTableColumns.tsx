import { DTColumnHeader } from "@avplatform/ui/data-table";
import { ColumnDef } from "@tanstack/react-table";

import { TABLE_KEY } from "../constants";
import { AgentsAssistDto } from "../dtos/agent-assist-dto";

/**
 * Array of table columns for the table.
 * Each column object contains an accessorKey, header component, and cell component.
 */
export const agentsAssistTableColumns: ColumnDef<AgentsAssistDto>[] = [
  {
    accessorKey: "name",
    header: ({ column }) => <DTColumnHeader tableKey={TABLE_KEY} column={column} title={"Name"} />,
    cell: ({ row }) => <div className="w-auto truncate font-medium">{row.getValue("name")}</div>,
  },
  {
    accessorKey: "versionNumber",
    header: ({ column }) => <DTColumnHeader tableKey={TABLE_KEY} column={column} title={""} />,
    cell: ({ row }) => (
      <div className="w-auto truncate font-mono font-medium tabular-nums">
        {row.getValue("versionNumber")}
      </div>
    ),
  },
  {
    accessorKey: "type",
    header: ({ column }) => <DTColumnHeader tableKey={TABLE_KEY} column={column} title={""} />,
    cell: ({ row }) => <div className="w-auto truncate font-medium">{row.getValue("type")}</div>,
  },
];

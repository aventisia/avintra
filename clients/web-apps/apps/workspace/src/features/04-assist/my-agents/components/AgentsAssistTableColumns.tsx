import { TableCNColumnHeader } from "@avplatform/ui/table-cn";
import { ColumnDef } from "@tanstack/react-table";

import { AgentsAssistDto } from "../dtos/agent-assist-dto";
import { getAgentTypeLabel } from "../utils/agent-type-label.util";

/**
 * Array of table columns for the table.
 * Each column object contains an accessorKey, header component, and cell component.
 */
export const agentsAssistTableColumns: ColumnDef<AgentsAssistDto>[] = [
  {
    accessorKey: "name",
    meta: { label: "Name" },
    header: ({ column }) => <TableCNColumnHeader column={column} label="Name" />,
    cell: ({ row }) => <div className="w-auto truncate font-medium">{row.getValue("name")}</div>,
  },
  {
    accessorKey: "versionNumber",
    meta: { label: "Version number" },
    header: ({ column }) => <TableCNColumnHeader column={column} label="Version number" />,
    cell: ({ row }) => (
      <div className="w-auto truncate font-mono font-medium tabular-nums">
        {row.getValue("versionNumber")}
      </div>
    ),
  },
  {
    accessorKey: "type",
    meta: { label: "Type" },
    header: ({ column }) => <TableCNColumnHeader column={column} label="Type" />,
    cell: ({ row }) => (
      <div className="w-auto truncate font-medium">{getAgentTypeLabel(row.original.type)}</div>
    ),
  },
];

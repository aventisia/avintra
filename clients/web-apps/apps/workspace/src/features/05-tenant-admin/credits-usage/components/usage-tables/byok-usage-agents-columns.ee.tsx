import { TableCNColumnHeader } from "@avplatform/ui/table-cn";
import { ColumnDef } from "@tanstack/react-table";

import { IByokAgents } from "../../dtos/byok-usage-dto.ee";

export const byokUsageAgentsColumns: ColumnDef<IByokAgents>[] = [
  {
    accessorKey: "agentName",
    id: "agentName",
    meta: { label: "Agent" },
    header: ({ column }) => <TableCNColumnHeader column={column} label="Agent" />,
    cell: ({ row }) => <p className="text-sm font-medium">{row.original.agentName || "--"}</p>,
  },
  {
    accessorKey: "totalConsumption",
    id: "totalConsumption",
    meta: { label: "Total consumption" },
    header: ({ column }) => <TableCNColumnHeader column={column} label="Total consumption" />,
    cell: ({ row }) => (
      <span className="font-mono font-medium tabular-nums">
        {row.original.totalConsumption.toLocaleString("en-US", { maximumFractionDigits: 2 })}
      </span>
    ),
  },
];

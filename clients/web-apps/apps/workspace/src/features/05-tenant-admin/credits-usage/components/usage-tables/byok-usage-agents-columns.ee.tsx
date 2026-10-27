import { DTColumnHeader } from "@avplatform/ui/data-table";
import { ColumnDef } from "@tanstack/react-table";

import { IByokAgents } from "../../dtos/byok-usage-dto.ee";

export const byokUsageAgentsColumns = (tableKey: string): ColumnDef<IByokAgents>[] => [
  {
    accessorKey: "agentName",
    id: "agentName",
    header: ({ column }) => <DTColumnHeader tableKey={tableKey} column={column} title="Agent" />,
    cell: ({ row }) => <p className="text-sm font-medium">{row.original.agentName || "--"}</p>,
  },
  {
    accessorKey: "totalConsumption",
    id: "totalConsumption",
    header: ({ column }) => (
      <DTColumnHeader tableKey={tableKey} column={column} title="Total Consumption" />
    ),
    cell: ({ row }) => (
      <span className="font-mono font-medium tabular-nums">
        {row.original.totalConsumption.toLocaleString("en-US", { maximumFractionDigits: 2 })}
      </span>
    ),
  },
];

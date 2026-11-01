import { TableCNColumnHeader } from "@avplatform/ui/table-cn";
import { ColumnDef } from "@tanstack/react-table";

import { IAgents } from "../../dtos/credits-usage-dto.ee";
import { UsageBreakdownCell } from "./UsageBreakdownCell.ee";

export const usageAgentsColumns: ColumnDef<IAgents>[] = [
  {
    accessorKey: "agentName",
    id: "agentName",
    meta: { label: "Agent" },
    header: ({ column }) => <TableCNColumnHeader column={column} label="Agent" />,
    cell: ({ row }) => <p className="text-sm font-medium">{row.original.agentName || "--"}</p>,
  },
  {
    accessorKey: "totalCredits",
    id: "totalCredits",
    meta: { label: "Total credits" },
    header: ({ column }) => <TableCNColumnHeader column={column} label="Total credits" />,
    cell: ({ row }) => (
      <span className="font-mono font-medium tabular-nums">
        {row.original.totalCredits.toLocaleString("en-US", { maximumFractionDigits: 2 })}
      </span>
    ),
  },
  {
    accessorKey: "totalLlmCredits",
    id: "totalLlmCredits",
    meta: { label: "LLM credits" },
    header: ({ column }) => <TableCNColumnHeader column={column} label="LLM credits" />,
    cell: ({ row }) => (
      <span className="font-mono tabular-nums">
        {row.original.totalLlmCredits.toLocaleString("en-US", { maximumFractionDigits: 2 })}
      </span>
    ),
  },
  {
    accessorKey: "totalExecutionCredits",
    id: "totalExecutionCredits",
    meta: { label: "Execution credits" },
    header: ({ column }) => <TableCNColumnHeader column={column} label="Execution credits" />,
    cell: ({ row }) => (
      <span className="font-mono tabular-nums">
        {row.original.totalExecutionCredits.toLocaleString("en-US", {
          maximumFractionDigits: 2,
        })}
      </span>
    ),
  },
  {
    accessorKey: "breakdown",
    id: "breakdown",
    meta: { label: "Breakdown" },
    header: () => <div className="text-left">Breakdown</div>,
    enableSorting: false,
    cell: ({ row }) => (
      <UsageBreakdownCell
        totalCredits={row.original.totalCredits}
        executionCredits={row.original.totalExecutionCredits}
        llmCredits={row.original.totalLlmCredits}
      />
    ),
  },
];

import { DTColumnHeader } from "@avplatform/ui/data-table";
import { ColumnDef } from "@tanstack/react-table";

import { IAgents } from "../../dtos/credits-usage-dto.ee";
import { UsageBreakdownCell } from "./UsageBreakdownCell.ee";

export const usageAgentsColumns = (tableKey: string): ColumnDef<IAgents>[] => [
  {
    accessorKey: "agentName",
    id: "agentName",
    header: ({ column }) => <DTColumnHeader tableKey={tableKey} column={column} title="Agent" />,
    cell: ({ row }) => <p className="text-sm font-medium">{row.original.agentName || "--"}</p>,
  },
  {
    accessorKey: "totalCredits",
    id: "totalCredits",
    header: ({ column }) => (
      <DTColumnHeader tableKey={tableKey} column={column} title="Total Credits" />
    ),
    cell: ({ row }) => (
      <span className="font-medium tabular-nums">
        {row.original.totalCredits.toLocaleString("en-US", { maximumFractionDigits: 2 })}
      </span>
    ),
  },
  {
    accessorKey: "totalLlmCredits",
    id: "totalLlmCredits",
    header: ({ column }) => (
      <DTColumnHeader tableKey={tableKey} column={column} title="LLM Credits" />
    ),
    cell: ({ row }) => (
      <span className="tabular-nums">
        {row.original.totalLlmCredits.toLocaleString("en-US", { maximumFractionDigits: 2 })}
      </span>
    ),
  },
  {
    accessorKey: "totalExecutionCredits",
    id: "totalExecutionCredits",
    header: ({ column }) => (
      <DTColumnHeader tableKey={tableKey} column={column} title="Execution Credits" />
    ),
    cell: ({ row }) => (
      <span className="tabular-nums">
        {row.original.totalExecutionCredits.toLocaleString("en-US", {
          maximumFractionDigits: 2,
        })}
      </span>
    ),
  },
  {
    accessorKey: "breakdown",
    id: "breakdown",
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

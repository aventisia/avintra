import { Avatar, AvatarFallback } from "@avplatform/ui/avatar";
import { DTColumnHeader } from "@avplatform/ui/data-table";
import { ColumnDef } from "@tanstack/react-table";

import { IUsers } from "../../dtos/credits-usage-dto.ee";
import { UsageBreakdownCell } from "./UsageBreakdownCell.ee";

export const usageUsersColumns = (tableKey: string): ColumnDef<IUsers>[] => [
  {
    accessorKey: "fullName",
    id: "fullName",
    accessorFn: (row) => `${row.firstName} ${row.lastName}`.trim() || row.username,
    header: ({ column }) => <DTColumnHeader tableKey={tableKey} column={column} title="User" />,
    cell: ({ row }) => {
      const fullName = `${row.original.firstName} ${row.original.lastName}`.trim();
      const initials = fullName
        .split(" ")
        .map((word) => word[0])
        .filter(Boolean)
        .join("")
        .slice(0, 2)
        .toUpperCase();

      return (
        <div className="flex items-center gap-3">
          <Avatar className="flex h-7 w-7">
            <AvatarFallback className="border-none bg-primary-200 text-2xs capitalize tracking-wider text-secondary">
              {initials || "--"}
            </AvatarFallback>
          </Avatar>
          <div className="flex flex-col">
            <p className="text-sm font-medium">{fullName || row.original.username}</p>
            {row.original.username && (
              <p className="text-xs text-muted-foreground">{row.original.username}</p>
            )}
          </div>
        </div>
      );
    },
  },
  {
    accessorKey: "totalCredits",
    id: "totalCredits",
    header: ({ column }) => (
      <DTColumnHeader tableKey={tableKey} column={column} title="Total credits" />
    ),
    cell: ({ row }) => (
      <span className="font-mono font-medium tabular-nums">
        {row.original.totalCredits.toLocaleString("en-US", { maximumFractionDigits: 2 })}
      </span>
    ),
  },
  {
    accessorKey: "totalLlmCredits",
    id: "totalLlmCredits",
    header: ({ column }) => (
      <DTColumnHeader tableKey={tableKey} column={column} title="LLM credits" />
    ),
    cell: ({ row }) => (
      <span className="font-mono tabular-nums">
        {row.original.totalLlmCredits.toLocaleString("en-US", { maximumFractionDigits: 2 })}
      </span>
    ),
  },
  {
    accessorKey: "totalExecutionCredits",
    id: "totalExecutionCredits",
    header: ({ column }) => (
      <DTColumnHeader tableKey={tableKey} column={column} title="Execution credits" />
    ),
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

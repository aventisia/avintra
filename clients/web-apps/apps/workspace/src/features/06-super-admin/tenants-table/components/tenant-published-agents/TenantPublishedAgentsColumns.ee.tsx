import { DTColumnHeader, createDTActionsColumn } from "@avplatform/ui/data-table";
import { formatDate } from "@avplatform/ui/utils";
import { ColumnDef } from "@tanstack/react-table";

import { TenantPublishedAgentDto } from "../../dtos/tenant-published-agent-dto.ee";
import { formatSecondsToCompactDuration, round2 } from "../../utils";
import { TenantPublishedAgentRowActions } from "./TenantPublishedAgentRowActions.ee";

const TABLE_KEY = "tenant-published-agents";

/**
 * Array of table columns for the tenant published agents table.
 */
export const tenantPublishedAgentsColumns: ColumnDef<TenantPublishedAgentDto>[] = [
  // AGENT NAME
  {
    accessorKey: "name",
    header: ({ column }) => (
      <DTColumnHeader tableKey={TABLE_KEY} column={column} title="Agent Name" />
    ),
    cell: ({ row }) => {
      const { name, versionNumber } = row.original;
      return (
        <div className="inline-flex items-center gap-1" title={name ?? ""}>
          <span className="truncate max-w-72 font-medium">{name ?? "—"}</span>
          <span className="bg-slate-100 border text-2xs rounded-xl h-[1.1rem] px-1.5 text-muted-foreground">
            v{versionNumber}
          </span>
        </div>
      );
    },
  },

  // PUBLISHED ON
  {
    accessorKey: "publishedOn",
    header: ({ column }) => (
      <DTColumnHeader tableKey={TABLE_KEY} column={column} title="Published on" />
    ),
    cell: ({ row }) => formatDate(row.getValue<Date>("publishedOn")),
  },

  // DAILY AVERAGE CREDITS (LAST 30 DAYS)
  {
    accessorKey: "dailyAverageCredits",
    header: ({ column }) => (
      <DTColumnHeader tableKey={TABLE_KEY} column={column} title="Daily Average Credits" />
    ),
    cell: ({ row }) => round2(row.getValue("dailyAverageCredits")),
  },

  // DAILY AVERAGE RUNTIME (LAST 30 DAYS)
  {
    accessorKey: "dailyAverageRuntime",
    header: ({ column }) => (
      <DTColumnHeader tableKey={TABLE_KEY} column={column} title="Daily Avg Runtime" />
    ),
    cell: ({ row }) => formatSecondsToCompactDuration(row.getValue("dailyAverageRuntime")),
  },

  // FIXED CREDIT VALUE
  {
    accessorKey: "fixedCredits",
    header: ({ column }) => (
      <DTColumnHeader tableKey={TABLE_KEY} column={column} title="Fixed Credit" />
    ),
    cell: ({ row }) => {
      const fixedCredits = row.getValue<number | null>("fixedCredits");
      return fixedCredits != null ? String(fixedCredits) : "Not Applicable";
    },
  },

  // 3 DOTS
  createDTActionsColumn<TenantPublishedAgentDto>({
    renderCell: (row) => <TenantPublishedAgentRowActions flowVersionId={row.id} />,
  }),
];

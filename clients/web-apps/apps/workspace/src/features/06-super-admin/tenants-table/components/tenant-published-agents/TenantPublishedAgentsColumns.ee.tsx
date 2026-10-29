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
      <DTColumnHeader tableKey={TABLE_KEY} column={column} title="Agent name" />
    ),
    cell: ({ row }) => {
      const { name, versionNumber } = row.original;
      return (
        <div className="inline-flex items-center gap-1" title={name ?? ""}>
          <span className="truncate max-w-72 font-medium">{name ?? "—"}</span>
          <span className="h-[1.1rem] rounded-sm border border-line bg-sunken px-1.5 font-mono text-2xs tabular-nums text-muted-foreground">
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
    cell: ({ row }) => (
      <span className="font-mono tabular-nums">
        {formatDate(row.getValue<Date>("publishedOn"))}
      </span>
    ),
  },

  // DAILY AVERAGE CREDITS (LAST 30 DAYS)
  {
    accessorKey: "dailyAverageCredits",
    header: ({ column }) => (
      <DTColumnHeader tableKey={TABLE_KEY} column={column} title="Daily average credits" />
    ),
    cell: ({ row }) => (
      <span className="font-mono tabular-nums">{round2(row.getValue("dailyAverageCredits"))}</span>
    ),
  },

  // DAILY AVERAGE RUNTIME (LAST 30 DAYS)
  {
    accessorKey: "dailyAverageRuntime",
    header: ({ column }) => (
      <DTColumnHeader tableKey={TABLE_KEY} column={column} title="Daily avg runtime" />
    ),
    cell: ({ row }) => (
      <span className="font-mono tabular-nums">
        {formatSecondsToCompactDuration(row.getValue("dailyAverageRuntime"))}
      </span>
    ),
  },

  // FIXED CREDIT VALUE
  {
    accessorKey: "fixedCredits",
    header: ({ column }) => (
      <DTColumnHeader tableKey={TABLE_KEY} column={column} title="Fixed credit" />
    ),
    cell: ({ row }) => {
      const fixedCredits = row.getValue<number | null>("fixedCredits");
      return fixedCredits != null ? (
        <span className="font-mono tabular-nums">{fixedCredits}</span>
      ) : (
        "Not Applicable"
      );
    },
  },

  // 3 DOTS
  createDTActionsColumn<TenantPublishedAgentDto>({
    renderCell: (row) => <TenantPublishedAgentRowActions flowVersionId={row.id} />,
  }),
];

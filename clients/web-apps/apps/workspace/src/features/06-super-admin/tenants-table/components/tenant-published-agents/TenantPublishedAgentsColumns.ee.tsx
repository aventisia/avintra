import { TABLE_CN_ACTIONS_COLUMN_ID, TableCNColumnHeader } from "@avplatform/ui/table-cn";
import { formatDate } from "@avplatform/ui/utils";
import { ColumnDef, HeaderContext, InitialTableState } from "@tanstack/react-table";

import { getRowActionsColumn } from "@/utils/get-row-actions-column.util";

import { TenantPublishedAgentDto } from "../../dtos/tenant-published-agent-dto.ee";
import { formatSecondsToCompactDuration, round2 } from "../../utils";
import { TenantPublishedAgentRowActions } from "./TenantPublishedAgentRowActions.ee";

export const TENANT_PUBLISHED_AGENTS_TABLE_KEY = "tenant-published-agents";

export const TENANT_PUBLISHED_AGENTS_INITIAL_STATE: InitialTableState = {
  pagination: { pageIndex: 0, pageSize: 50 },
  columnPinning: { right: [TABLE_CN_ACTIONS_COLUMN_ID] },
};

const renderHeader =
  (label: string) =>
  ({ column }: HeaderContext<TenantPublishedAgentDto, unknown>) => (
    <TableCNColumnHeader column={column} label={label} />
  );

/**
 * Array of table columns for the tenant published agents table.
 */
export const tenantPublishedAgentsColumns: ColumnDef<TenantPublishedAgentDto>[] = [
  // AGENT NAME
  {
    accessorKey: "name",
    meta: { label: "Agent name" },
    header: renderHeader("Agent name"),
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
    meta: { label: "Published on" },
    header: renderHeader("Published on"),
    cell: ({ row }) => (
      <span className="font-mono tabular-nums">
        {formatDate(row.getValue<Date>("publishedOn"))}
      </span>
    ),
  },

  // DAILY AVERAGE CREDITS (LAST 30 DAYS)
  {
    accessorKey: "dailyAverageCredits",
    meta: { label: "Daily average credits" },
    header: renderHeader("Daily average credits"),
    cell: ({ row }) => (
      <span className="font-mono tabular-nums">{round2(row.getValue("dailyAverageCredits"))}</span>
    ),
  },

  // DAILY AVERAGE RUNTIME (LAST 30 DAYS)
  {
    accessorKey: "dailyAverageRuntime",
    meta: { label: "Daily avg runtime" },
    header: renderHeader("Daily avg runtime"),
    cell: ({ row }) => (
      <span className="font-mono tabular-nums">
        {formatSecondsToCompactDuration(row.getValue("dailyAverageRuntime"))}
      </span>
    ),
  },

  // FIXED CREDIT VALUE
  {
    accessorKey: "fixedCredits",
    meta: { label: "Fixed credit" },
    header: renderHeader("Fixed credit"),
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
  getRowActionsColumn<TenantPublishedAgentDto>({
    actions: ({ row }) => <TenantPublishedAgentRowActions flowVersionId={row.original.id} />,
  }),
];

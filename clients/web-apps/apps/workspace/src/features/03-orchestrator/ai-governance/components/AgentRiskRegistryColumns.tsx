import { Badge, type BadgeProps } from "@avplatform/ui/badge";
import { DTColumnHeader } from "@avplatform/ui/data-table";
import { formatDate } from "@avplatform/ui/utils";
import { ColumnDef } from "@tanstack/react-table";
import { AlertTriangleIcon } from "lucide-react";

import { AI_GOVERNANCE_TABLE_KEY } from "../constants";
import { AgentRiskRegistryRowDto } from "../dtos/agent-risk-registry-row-dto";
import { RiskLifecycleStatus } from "../enums/lifecycle-state-enum";
import { AgentRiskTier } from "../enums/risk-tier-enum";

const tierBadgeClass: Record<AgentRiskTier, string> = {
  [AgentRiskTier.Low]: "border-ok/35 text-ok",
  [AgentRiskTier.Medium]: "border-warn/35 text-warn",
  [AgentRiskTier.High]: "border-bad/35 text-bad",
};

const tierLabel: Record<AgentRiskTier, string> = {
  [AgentRiskTier.Low]: "Low",
  [AgentRiskTier.Medium]: "Medium",
  [AgentRiskTier.High]: "High",
};

const statusBadgeVariant: Record<string, BadgeProps["variant"]> = {
  [RiskLifecycleStatus.NotAssessed]: "secondary",
  [RiskLifecycleStatus.InAssessment]: "draft",
  [RiskLifecycleStatus.Submitted]: "queued",
  [RiskLifecycleStatus.InReview]: "review",
  [RiskLifecycleStatus.Approved]: "completed",
  [RiskLifecycleStatus.ApprovedWithExceptions]: "review",
  [RiskLifecycleStatus.Monitored]: "outline",
  [RiskLifecycleStatus.ActionRequired]: "failed",
  [RiskLifecycleStatus.Retired]: "secondary",
};

const statusLabel: Record<string, string> = {
  [RiskLifecycleStatus.NotAssessed]: "Not Assessed",
  [RiskLifecycleStatus.InAssessment]: "In Assessment",
  [RiskLifecycleStatus.Submitted]: "Submitted",
  [RiskLifecycleStatus.InReview]: "In Review",
  [RiskLifecycleStatus.Approved]: "Approved",
  [RiskLifecycleStatus.ApprovedWithExceptions]: "Approved w/ Exceptions",
  [RiskLifecycleStatus.Monitored]: "Monitored",
  [RiskLifecycleStatus.ActionRequired]: "Action Required",
  [RiskLifecycleStatus.Retired]: "Retired",
};

const renderTier = (tier: AgentRiskTier | null) =>
  tier ? (
    <Badge variant="outline" className={tierBadgeClass[tier]}>
      {tierLabel[tier]}
    </Badge>
  ) : (
    <span className="text-muted-foreground">-</span>
  );

const renderStatus = (status: RiskLifecycleStatus) => (
  <Badge variant={statusBadgeVariant[status] ?? "secondary"}>
    {statusLabel[status] ?? status.charAt(0).toUpperCase() + status.slice(1)}
  </Badge>
);

const renderDate = (date: string) =>
  date ? (
    <span className="font-mono tabular-nums">{formatDate(new Date(date))}</span>
  ) : (
    <span className="text-muted-foreground">-</span>
  );

/**
 * Builds columns for the Agent Risk Registry table.
 * The agent name is clickable and opens the Agent Risk Registry wizard.
 */
export const buildAgentRiskRegistryColumns = (
  onOpenAgent: (assessment: {
    flowVersionId: string;
    flowId: string;
    name: string;
    agentType?: string;
    versionNumber?: number;
    publishedOn?: string;
  }) => void,
  onOpenIssues: (flowVersionId: string) => void,
): ColumnDef<AgentRiskRegistryRowDto>[] => [
  {
    accessorKey: "name",
    header: ({ column }) => (
      <DTColumnHeader tableKey={AI_GOVERNANCE_TABLE_KEY} column={column} title="Agent Name" />
    ),
    cell: ({ row }) => (
      <div className="flex items-center gap-2">
        <button
          type="button"
          className="cursor-pointer font-medium text-primary underline-offset-4 hover:underline"
          onClick={() =>
            onOpenAgent({
              flowVersionId: row.original.flowVersionId,
              flowId: row.original.flowId,
              name: row.original.name,
              agentType: row.original.agentType,
              versionNumber: row.original.versionNumber,
              publishedOn: row.original.publishedOn,
            })
          }
        >
          {row.original.name}
        </button>
        {row.original.versionNumber > 0 && (
          <Badge variant="outline" className="shrink-0">
            v{row.original.versionNumber}
          </Badge>
        )}
      </div>
    ),
  },
  {
    accessorKey: "compositeTier",
    header: ({ column }) => (
      <DTColumnHeader
        tableKey={AI_GOVERNANCE_TABLE_KEY}
        column={column}
        title="Composite Risk Tier"
      />
    ),
    cell: ({ row }) => renderTier(row.original.compositeTier),
  },
  {
    accessorKey: "status",
    header: ({ column }) => (
      <DTColumnHeader tableKey={AI_GOVERNANCE_TABLE_KEY} column={column} title="Status" />
    ),
    cell: ({ row }) => renderStatus(row.original.status),
  },
  {
    accessorKey: "openIssues",
    header: ({ column }) => (
      <DTColumnHeader tableKey={AI_GOVERNANCE_TABLE_KEY} column={column} title="Open Issues" />
    ),
    cell: ({ row }) =>
      row.original.openIssues > 0 ? (
        <Badge variant="destructive" className="tabular-nums">
          {row.original.openIssues}
        </Badge>
      ) : (
        <span className="font-mono tabular-nums text-muted-foreground">0</span>
      ),
  },
  {
    accessorKey: "reviewDate",
    header: ({ column }) => (
      <DTColumnHeader tableKey={AI_GOVERNANCE_TABLE_KEY} column={column} title="Reviewed On" />
    ),
    cell: ({ row }) => renderDate(row.original.reviewDate),
  },
  {
    accessorKey: "approvalDate",
    header: ({ column }) => (
      <DTColumnHeader tableKey={AI_GOVERNANCE_TABLE_KEY} column={column} title="Approved On" />
    ),
    cell: ({ row }) => renderDate(row.original.approvalDate),
  },
  {
    id: "issues",
    header: "",
    cell: ({ row }) => (
      <button
        type="button"
        className="inline-flex items-center gap-1 text-[13px] font-medium text-muted-foreground transition-colors hover:text-primary"
        onClick={() => onOpenIssues(row.original.flowVersionId)}
      >
        <AlertTriangleIcon className="h-4 w-4" />
        Issues
      </button>
    ),
  },
];

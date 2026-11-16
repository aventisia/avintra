import { useDocumentTitle } from "@avplatform/ui/hooks";
import {
  TableCN,
  TableCNHeading,
  TableCNSkeleton,
  TableCNToolbar,
  useTableCN,
} from "@avplatform/ui/table-cn";

import { AGENT_RISK_PAGE_SIZE_OPTIONS, AI_GOVERNANCE_TABLE_KEY } from "../constants";
import { AGENT_RISK_INITIAL_STATE } from "../constants/registry-columns";
import { useAgentRiskRegistryRows } from "../hooks/useAgentRiskRegistryRows";
import { usePendingApprovals } from "../hooks/usePendingApprovals";
import { createEmptyAssessment, useAiGovernanceStore } from "../stores/ai-governance-store";
import { buildAgentRiskRegistryColumns } from "./AgentRiskRegistryColumns";

const PAGINATION_PROPS = { pageSizeOptions: AGENT_RISK_PAGE_SIZE_OPTIONS };

/**
 * Renders the Agent Risk Registry table - the first screen of the page.
 * Lists agents with their risk-tier, status, and validation dates.
 * Clicking an agent name opens its registry wizard.
 */
export const AgentRiskRegistryTable = () => {
  useDocumentTitle("Agent risk registry");

  const openAgent = useAiGovernanceStore((state) => state.openAgent);
  const openIssues = useAiGovernanceStore((state) => state.openIssues);
  const updateAssessment = useAiGovernanceStore((state) => state.updateAssessment);
  const assessments = useAiGovernanceStore((state) => state.assessments);

  const { rows, isLoading } = useAgentRiskRegistryRows();
  const { rows: pendingApprovals } = usePendingApprovals();

  const handleOpen = (ref: {
    flowVersionId: string;
    flowId: string;
    name: string;
    agentType?: string;
    versionNumber?: number;
    publishedOn?: string;
  }) => {
    // Preserve any already-loaded in-memory assessment (e.g. from a previous
    // save) so the form keeps its data when the user reopens it.
    const existing = assessments[ref.flowVersionId];
    openAgent(
      existing
        ? existing
        : {
            ...createEmptyAssessment(),
            flowVersionId: ref.flowVersionId,
            flowId: ref.flowId,
            agentName: ref.name,
            agentType: ref.agentType ?? "",
            versionNumber: ref.versionNumber ?? 0,
            publishedOn: ref.publishedOn ?? "",
          },
    );
  };

  const handleOpenIssues = (ref: { flowVersionId: string; flowId: string; name: string }) => {
    // Seed the assessment so the issues view has context, then switch to issues mode.
    updateAssessment(ref.flowVersionId, {
      ...createEmptyAssessment(),
      flowVersionId: ref.flowVersionId,
      flowId: ref.flowId,
      agentName: ref.name,
    });
    openIssues(ref.flowVersionId);
  };

  const columns = buildAgentRiskRegistryColumns(handleOpen, (flowVersionId) => {
    const row = rows.find((r) => r.flowVersionId === flowVersionId);
    if (row) {
      handleOpenIssues({
        flowVersionId: row.flowVersionId,
        flowId: row.flowId,
        name: row.name,
      });
    }
  });

  // Create a TableCN table; page, size, and sorting live in the URL
  const { table } = useTableCN({
    data: rows,
    columns,
    initialState: AGENT_RISK_INITIAL_STATE,
    persistKey: AI_GOVERNANCE_TABLE_KEY,
    searchColumns: ["name"],
  });

  if (isLoading) {
    return <TableCNSkeleton columnCount={7} />;
  }

  return (
    <div className="space-y-4 pb-4 pt-[17px]">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <TableCNHeading heading="Agent risk registry" />
        </div>
      </div>

      {pendingApprovals.length > 0 && (
        <div className="flex items-center gap-2 rounded-lg border border-warn/35 bg-warn/10 px-4 py-2.5 text-sm">
          <span className="font-semibold text-warn">
            {pendingApprovals.length} assessment{pendingApprovals.length > 1 ? "s" : ""} awaiting
            your approval
          </span>
          <button
            type="button"
            className="font-medium text-primary underline-offset-4 hover:underline"
            onClick={() => {
              const first = pendingApprovals[0];
              if (first)
                handleOpen({
                  flowVersionId: first.flowVersionId,
                  flowId: first.flowId,
                  name: first.name,
                });
            }}
          >
            Review
          </button>
        </div>
      )}

      <div className="flex flex-col gap-2">
        <TableCN table={table} label="Agent risk registry" paginationProps={PAGINATION_PROPS}>
          <TableCNToolbar table={table} searchPlaceholder="Search agents..." />
        </TableCN>
      </div>
    </div>
  );
};

import {
  DTHeading,
  DTPagination,
  DTSearchBox,
  DTViewOptions,
  DataTable,
  DataTableSkeleton,
  getDataTablePreferences,
} from "@avplatform/ui/data-table";
import { useDataTable, useDocumentTitle } from "@avplatform/ui/hooks";

import { HelpButton } from "@/components/help/HelpButton";

import { AI_GOVERNANCE_TABLE_KEY } from "../constants";
import { columnDisplayNames, columnVisibilityState } from "../constants/registry-columns";
import { usePendingApprovals } from "../hooks/usePendingApprovals";
import { useAgentRiskRegistryRows } from "../hooks/useAgentRiskRegistryRows";
import { createEmptyAssessment, useAiGovernanceStore } from "../stores/ai-governance-store";
import { buildAgentRiskRegistryColumns } from "./AgentRiskRegistryColumns";

/**
 * Renders the Agent Risk Registry table - the first screen of the page.
 * Lists agents with their risk-tier, status, and validation dates.
 * Clicking an agent name opens its registry wizard.
 */
export const AgentRiskRegistryTable = () => {
  useDocumentTitle("Agent Risk Registry");

  const openAgent = useAiGovernanceStore((state) => state.openAgent);
  const openIssues = useAiGovernanceStore((state) => state.openIssues);
  const updateAssessment = useAiGovernanceStore((state) => state.updateAssessment);
  const assessments = useAiGovernanceStore((state) => state.assessments);

  const { columnVisibility, sortState } = getDataTablePreferences(
    AI_GOVERNANCE_TABLE_KEY,
    columnVisibilityState,
  );

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
  const table = useDataTable(columns, rows, columnVisibility, sortState, false);

  if (isLoading) {
    return <DataTableSkeleton />;
  }

  return (
    <div className="space-y-4 pb-4 pt-[17px]">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <DTHeading heading="Agent Risk Registry" />
          <HelpButton guideId="agent-risk-registry" />
        </div>

        <div className="flex items-center gap-2">
          <DTSearchBox table={table} searchColumns={["name"]} placeholder="Search agents..." />
          <DTViewOptions
            {...{
              table,
              columnDisplayNames,
              tableKey: AI_GOVERNANCE_TABLE_KEY,
            }}
          />
        </div>
      </div>

      {pendingApprovals.length > 0 && (
        <div className="flex items-center gap-2 rounded-lg border border-amber-500/30 bg-amber-500/10 px-4 py-2.5 text-sm">
          <span className="font-semibold text-amber-700">
            {pendingApprovals.length} assessment{pendingApprovals.length > 1 ? "s" : ""} awaiting
            your approval
          </span>
          <button
            type="button"
            className="font-medium text-primary underline-offset-4 hover:underline"
            onClick={() => {
              const first = pendingApprovals[0];
              if (first) handleOpen({ flowVersionId: first.flowVersionId, flowId: first.flowId, name: first.name });
            }}
          >
            Review
          </button>
        </div>
      )}

      <div className="flex flex-col gap-2">
        <DataTable table={table} columnsLength={columns.length} />
      </div>

      <DTPagination table={table} />
    </div>
  );
};

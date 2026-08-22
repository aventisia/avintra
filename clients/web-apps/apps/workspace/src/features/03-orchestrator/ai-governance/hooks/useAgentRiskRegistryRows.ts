import { toast } from "@avplatform/ui/sonner";
import { useQuery } from "@tanstack/react-query";
import { useEffect, useMemo } from "react";
import { useShallow } from "zustand/react/shallow";

import { useCurrentSpaceStore } from "@/stores/current-space-store";

import { getPublishedAgents } from "../../agents-table/apis/agents-table-apis";
import { getAgentRiskRegistryRows } from "../apis/agent-risk-registry-apis";
import { AI_GOVERNANCE_DATA_QUERY_KEY } from "../constants";
import { AgentRiskRegistryRowDto } from "../dtos/agent-risk-registry-row-dto";
import { RiskLifecycleStatus } from "../enums/lifecycle-state-enum";
import { useAiGovernanceStore } from "../stores/ai-governance-store";
import { computeAgentRiskTier } from "../utils/tiering-engine";

/** Maps the raw flow type to a human-friendly agent type label. */
const agentTypeLabel = (type?: string): string => {
  if (type === "ChatAgent") return "Chat Agent";
  if (type === "Agent") return "Automation Agent";
  return type ?? "";
};

/**
 * Fetches the published agents and enriches them with the saved agent risk
 * registry state, then overlays any live (in-memory) assessment edits so the
 * table updates in real time as the form is filled.
 */
export const useAgentRiskRegistryRows = () => {
  const { currentSpace } = useCurrentSpaceStore(
    useShallow((state) => ({
      currentSpace: state.currentSpace,
    })),
  );

  const assessments = useAiGovernanceStore((state) => state.assessments);

  const agentsQuery = useQuery({
    queryKey: [...AI_GOVERNANCE_DATA_QUERY_KEY, "agents", currentSpace?.id],
    queryFn: getPublishedAgents,
  });

  const registryQuery = useQuery({
    queryKey: [...AI_GOVERNANCE_DATA_QUERY_KEY, "rows", currentSpace?.id],
    queryFn: getAgentRiskRegistryRows,
  });

  useEffect(() => {
    if (agentsQuery.isError)
      toast.error(agentsQuery.error?.toString() ?? "Failed to load published agents.");
  }, [agentsQuery.error, agentsQuery.isError]);

  useEffect(() => {
    if (registryQuery.isError)
      toast.error(registryQuery.error?.toString() ?? "Failed to load the agent risk registry.");
  }, [registryQuery.error, registryQuery.isError]);

  const rows = useMemo<AgentRiskRegistryRowDto[]>(() => {
    const agents = agentsQuery.data?.data ?? [];
    const registryById = new Map<string, AgentRiskRegistryRowDto>(
      (registryQuery.data?.data ?? []).map((row) => [row.flowVersionId, row]),
    );

    return agents.map((agent) => {
      const existing = registryById.get(agent.id);
      // Live in-memory assessment (updates as the user fills the form).
      const live = assessments[agent.id];

      // Composite tier: prefer the live-computed value when any sub-score is set,
      // otherwise fall back to the saved tier.
      const liveTier = live
        ? computeAgentRiskTier({
            scopeScore: live.scopeScore,
            dataSensitivityScore: live.dataSensitivityScore,
            dependencyComplexityScore: live.dependencyComplexityScore,
            supervisoryImpactScore: live.supervisoryImpactScore,
          })
        : null;

      return {
        flowVersionId: agent.id,
        flowId: agent.refId,
        name: agent.name ?? "Untitled",
        agentType: agentTypeLabel(agent.type),
        versionNumber: agent.versionNumber ?? 0,
        publishedOn: agent.createdOn ? new Date(agent.createdOn).toISOString() : "",
        compositeTier: liveTier ?? existing?.compositeTier ?? null,
        status: live?.status ?? existing?.status ?? RiskLifecycleStatus.NotAssessed,
        openIssues:
          live?.issues?.filter((i) => i.status === "open" || i.status === "investigating").length ??
          existing?.openIssues ??
          0,
        reviewDate: live?.approval?.requestedOn ?? existing?.reviewDate ?? "",
        approvalDate: live?.approval?.decidedOn ?? existing?.approvalDate ?? "",
      };
    });
  }, [agentsQuery.data?.data, registryQuery.data?.data, assessments]);

  return {
    rows,
    isFetching: agentsQuery.isFetching || registryQuery.isFetching,
    isLoading: agentsQuery.isLoading || registryQuery.isLoading,
    refetch: () => {
      agentsQuery.refetch();
      registryQuery.refetch();
    },
  };
};

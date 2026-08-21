import { toast } from "@avplatform/ui/sonner";
import { useQuery } from "@tanstack/react-query";

import { getAgentRiskRegistryByFlowVersion } from "../apis/agent-risk-registry-apis";
import { createEmptyAssessment } from "../stores/ai-governance-store";

/**
 * Loads the full agent risk registry record for a flow version.
 * Falls back to an empty assessment (seeded with agent identity) if the
 * backend has no record yet.
 */
export const useLoadAgentRiskRegistry = (flowVersionId: string | null) => {
  return useQuery({
    queryKey: ["agent-risk-registry", flowVersionId],
    queryFn: async () => {
      if (!flowVersionId) return createEmptyAssessment();
      try {
        const res = await getAgentRiskRegistryByFlowVersion(flowVersionId);
        return res.data;
      } catch (error) {
        const err = error as Error;
        // 404 / no record yet -> start empty.
        if (err.message?.toLowerCase().includes("not found") || err.message?.includes("404")) {
          return createEmptyAssessment();
        }
        toast.error(err.message ?? "Failed to load the agent risk registry record.");
        throw error;
      }
    },
    enabled: !!flowVersionId,
  });
};

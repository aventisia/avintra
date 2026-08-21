import { toast } from "@avplatform/ui/sonner";
import { useMutation, useQueryClient } from "@tanstack/react-query";

import { upsertAgentRiskRegistry } from "../apis/agent-risk-registry-apis";
import { AI_GOVERNANCE_DATA_QUERY_KEY } from "../constants";
import { AgentRiskAssessmentDto } from "../dtos/agent-risk-assessment-dto";
import { AgentRiskRegistryUpsertDto } from "../dtos/agent-risk-registry-upsert-dto";
import { useAiGovernanceStore } from "../stores/ai-governance-store";

/**
 * Builds the upsert DTO from the assessment. Sends human-input fields; the
 * backend resolves and persists the AI-model/tool lists at save-time.
 */
const toUpsertDto = (assessment: AgentRiskAssessmentDto): AgentRiskRegistryUpsertDto => ({
  flowVersionId: assessment.flowVersionId,
  flowId: assessment.flowId,
  isConsumerFacing: assessment.isConsumerFacing,
  intendedUse: assessment.intendedUse,
  businessProcesses: assessment.businessProcesses,
  scopeScore: assessment.scopeScore,
  dataSensitivityScore: assessment.dataSensitivityScore,
  dependencyComplexityScore: assessment.dependencyComplexityScore,
  supervisoryImpactScore: assessment.supervisoryImpactScore,
  tierJustification: assessment.tierJustification,
  status: assessment.status,
  lastValidationDate: assessment.lastValidationDate,
  nextReviewDate: assessment.nextReviewDate,
  validatorUserId: assessment.validatorUserId,
  risks: assessment.risks,
  aiModels: assessment.aiModels,
  thirdPartyTools: assessment.thirdPartyTools,
  approval: assessment.approval,
  issues: assessment.issues,
});

/**
 * Saves the agent risk registry record to the backend.
 * Pass `silent: true` to persist without showing the success toast (used when
 * validation fails so only the validation warning is shown).
 */
export const useSaveAgentRiskRegistry = () => {
  const queryClient = useQueryClient();
  const updateAssessment = useAiGovernanceStore((state) => state.updateAssessment);

  return useMutation({
    mutationFn: ({
      assessment,
      silent,
    }: {
      assessment: AgentRiskAssessmentDto;
      silent?: boolean;
    }) =>
      upsertAgentRiskRegistry(toUpsertDto(assessment)).then((res) => ({
        saved: res.data,
        variables: assessment,
        silent: !!silent,
      })),
    onSuccess: ({ saved, variables, silent }) => {
      if (saved) {
        // Persist the backend-resolved model/tool lists back into local state.
        updateAssessment(saved.flowVersionId, saved);
      } else {
        updateAssessment(variables.flowVersionId, variables);
      }
      if (!silent) toast.success("Agent risk registry record saved.");
      queryClient.invalidateQueries({ queryKey: AI_GOVERNANCE_DATA_QUERY_KEY });
    },
    onError: (error: Error) => {
      toast.error(error.message ?? "Failed to save the agent risk registry record.");
    },
  });
};

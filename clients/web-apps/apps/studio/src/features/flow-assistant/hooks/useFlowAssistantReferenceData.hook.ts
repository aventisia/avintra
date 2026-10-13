import { useQuery } from "@tanstack/react-query";
import { useEffect } from "react";

import { searchFlowVersions } from "@/apis/search-flow-versions-api";
import { getKnowledgeBaseSelectOptions } from "@/features/dynamic-config-panel/apis/knowledge-base-apis";
import { getQueuesByAgent } from "@/features/dynamic-config-panel/apis/queues-apis";
import { getSkillSelectOptions } from "@/features/dynamic-config-panel/apis/skill-registry-apis";
import { getTenantModelProviders } from "@/features/dynamic-config-panel/apis/tenant-model-provider-apis";
import { getFlowBlocks } from "@/features/flow-block/apis/flow-block-apis";
import { useCurrentFlowStore } from "@/stores/current-flow-store";

import { FlowAssistantReferenceDataDto } from "../dtos/flow-assistant-reference-data-dto";
import { useFlowAssistantStore } from "../stores/flow-assistant-store";

const REFERENCE_DATA_STALE_TIME_MS = 5 * 60 * 1000;

const uniqueNames = (names: (string | undefined | null)[]): string[] => [
  ...new Set(
    names.filter((name): name is string => typeof name === "string" && name.trim().length > 0),
  ),
];

const settledValue = (result: PromiseSettledResult<string[]>): string[] =>
  result.status === "fulfilled" ? result.value : [];

const fetchReferenceData = async (
  flowVersionId: string,
): Promise<FlowAssistantReferenceDataDto> => {
  const [queues, agents, blocks, modelProviders, skills, knowledgeBases] = await Promise.allSettled(
    [
      getQueuesByAgent(flowVersionId).then((response) =>
        uniqueNames((response?.data ?? []).map((queue) => queue.name)),
      ),
      searchFlowVersions("", "Agent", true).then((response) =>
        uniqueNames((response?.data ?? []).map((agent) => agent.name)),
      ),
      import.meta.env.MODE === "production"
        ? Promise.resolve<string[]>([])
        : getFlowBlocks(flowVersionId).then((response) =>
            uniqueNames((response?.data ?? []).map((block) => block.name)),
          ),
      getTenantModelProviders().then((response) =>
        uniqueNames((response?.data ?? []).map((provider) => provider.providerType)),
      ),
      getSkillSelectOptions().then((response) =>
        uniqueNames((response?.data ?? []).map((option) => option.label)),
      ),
      getKnowledgeBaseSelectOptions().then((response) =>
        uniqueNames((response?.data ?? []).map((option) => option.label)),
      ),
    ],
  );

  return {
    queues: settledValue(queues),
    agents: settledValue(agents),
    blocks: settledValue(blocks),
    modelProviders: settledValue(modelProviders),
    skills: settledValue(skills),
    knowledgeBases: settledValue(knowledgeBases),
  };
};

/** Loads and caches compact reference values the assistant may use to fill node configuration. */
export const useFlowAssistantReferenceData = () => {
  const flowVersionId = useCurrentFlowStore((state) => state.currentFlow.versionId);
  const setReferenceData = useFlowAssistantStore((state) => state.setReferenceData);

  const { data } = useQuery({
    queryKey: ["flow-assistant-reference-data", flowVersionId],
    queryFn: () => fetchReferenceData(flowVersionId),
    enabled: Boolean(flowVersionId),
    staleTime: REFERENCE_DATA_STALE_TIME_MS,
  });

  useEffect(() => {
    if (data) setReferenceData(data);
  }, [data, setReferenceData]);
};

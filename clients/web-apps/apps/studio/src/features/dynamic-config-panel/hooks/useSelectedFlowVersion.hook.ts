import { useQuery } from "@tanstack/react-query";

import { getFlowVersion, searchFlowVersions } from "@/apis/search-flow-versions-api";

const searchFlows = (query: string) =>
  searchFlowVersions(query, "Agent", false).then((response) => response.data ?? []);

/**
 * Resolves the agent version behind a flow-select value.
 */
export const useSelectedFlowVersion = (flowVersionId?: string) => {
  const { data } = useQuery({
    queryKey: ["flow-version", flowVersionId],
    queryFn: () => getFlowVersion(flowVersionId as string),
    select: (response) => response.data ?? null,
    enabled: Boolean(flowVersionId),
  });

  return data ?? null;
};

export { searchFlows };

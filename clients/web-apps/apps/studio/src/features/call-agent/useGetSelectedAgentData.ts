import { SearchFlowVersionResDto } from "@/dtos/search-flow-version-res-dto";

import { useReactFlow } from "@xyflow/react";

export type SelectedCallAgent = Pick<
  SearchFlowVersionResDto,
  "id" | "flowId" | "name" | "versionNumber"
>;

/**
 * Hook to get `selectedAgent` in node data.
 */
export const useGetSelectedAgentData = () => {
  //  Get the  node
  const { getNode } = useReactFlow();
  /**
   * Get `selectedAgent` from node data
   */
  const getSelectedAgentData = (nodeId: string): SelectedCallAgent | null => {
    const node = getNode(nodeId);
    const selectedAgent = node?.data?.selectedAgent as
      | Partial<SelectedCallAgent>
      | undefined;

    if (
      selectedAgent &&
      typeof selectedAgent.id === "string" &&
      typeof selectedAgent.flowId === "string"
    ) {
      return {
        id: selectedAgent.id,
        flowId: selectedAgent.flowId,
        name: selectedAgent.name ?? "",
        versionNumber: selectedAgent.versionNumber,
      };
    }

    return null;
  };

  return {
    getSelectedAgentData,
  };
};

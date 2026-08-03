import { useReactFlow } from "@xyflow/react";

import { SearchFlowVersionResDto } from "@/dtos/search-flow-version-res-dto";

export type SelectedCallBlock = Pick<
  SearchFlowVersionResDto,
  "id" | "flowId" | "name" | "versionNumber"
>;

/**
 * Hook to get `selectedBlock` in node data.
 */
export const useGetSelectedBlockData = () => {
  //  Get the  node
  const { getNode } = useReactFlow();
  /**
   * Get `selectedBlock` from node data
   */
  const getSelectedBlockData = (nodeId: string): SelectedCallBlock | null => {
    const node = getNode(nodeId);
    const selectedBlock = node?.data?.selectedBlock as Partial<SelectedCallBlock> | undefined;

    if (
      selectedBlock &&
      typeof selectedBlock.id === "string" &&
      typeof selectedBlock.flowId === "string"
    ) {
      return {
        id: selectedBlock.id,
        flowId: selectedBlock.flowId,
        name: selectedBlock.name ?? "",
        versionNumber: selectedBlock.versionNumber,
      };
    }

    return null;
  };

  return {
    getSelectedBlockData,
  };
};

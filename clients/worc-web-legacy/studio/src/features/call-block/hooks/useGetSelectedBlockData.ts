import { useReactFlow } from "@xyflow/react";

/**
 * Hook to get `selectedBlock` in node data.
 */
export const useGetSelectedBlockData = () => {
  //  Get the  node
  const { getNode } = useReactFlow();
  /**
   * Get `selectedBlock` from node data
   */
  const getSelectedBlockData = (
    nodeId: string,
  ): { [key: string]: string } | undefined => {
    const node = getNode(nodeId);
    return node?.data?.selectedBlock as { [key: string]: string };
  };

  return {
    getSelectedBlockData,
  };
};

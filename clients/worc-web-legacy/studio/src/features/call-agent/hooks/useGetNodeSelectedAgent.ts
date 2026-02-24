import { useReactFlow } from "@xyflow/react";

/**
 * Hook to get `selectedAgent` in node data.
 */
export const useGetNodeSelectedAgent = () => {
  //  Get the  node
  const { getNode } = useReactFlow();
  /**
   * Get `selectedAgent` from node data
   */
  const getNodeSelectedAgent = (
    nodeId: string,
  ): { [key: string]: string } | undefined => {
    const node = getNode(nodeId);
    return node?.data?.selectedAgent as { [key: string]: string };
  };

  return {
    getNodeSelectedAgent,
  };
};

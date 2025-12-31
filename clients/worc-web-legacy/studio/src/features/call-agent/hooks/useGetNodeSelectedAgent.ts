import { useReactFlowExtStore } from "@/stores/react-flow-ext-store";
import { useShallow } from "zustand/react/shallow";

/**
 * Hook to get `selectedAgent` in node data.
 */
export const useGetNodeSelectedAgent = () => {
  const { nodes } = useReactFlowExtStore(
    useShallow((state) => ({
      nodes: state.nodes,
      setNodes: state.setNodes,
    })),
  );
  /**
   * Get `selectedAgent` from node data
   */
  const getNodeSelectedAgent = (
    nodeId: string,
  ): { [key: string]: string } | undefined => {
    const node = nodes.find((n) => n.id === nodeId);
    return node?.data?.selectedAgent as { [key: string]: string };
  };

  return {
    getNodeSelectedAgent,
  };
};

import { useReactFlowExtStore } from "@/stores/react-flow-ext-store";
import { useShallow } from "zustand/react/shallow";

/**
 * Hook to get `selectedBlock` in node data.
 */
export const useGetSelectedBlockData = () => {
  const { nodes } = useReactFlowExtStore(
    useShallow((state) => ({
      nodes: state.nodes,
      setNodes: state.setNodes,
    })),
  );
  /**
   * Get `selectedBlock` from node data
   */
  const getSelectedBlockData = (
    nodeId: string,
  ): { [key: string]: string } | undefined => {
    const node = nodes.find((n) => n.id === nodeId);
    return node?.data?.selectedBlock as { [key: string]: string };
  };

  return {
    getSelectedBlockData,
  };
};

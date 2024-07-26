import { useTrackSelectionStore } from "@/stores/track-selection-store";
import { Edge, Node, useOnSelectionChange } from "@xyflow/react";
import { useCallback } from "react";
import { useShallow } from "zustand/react/shallow";

type SelectionType = {
  nodes: Node[];
  edges: Edge[];
};

/**
 * Keeps track of currently selected node and edges.
 *
 * It provides a handler to return selected single node (if selected).
 *
 * Note: The hook has to be used in the parent component of the ReactFlow component
 */
export const useTrackSelection = () => {
  // Get TrackSelection store state & actions
  const { selectedNodes, setSelectedNodes, setSelectedEdges } =
    useTrackSelectionStore(
      useShallow((state) => ({
        selectedNodes: state.selectedNodes,
        setSelectedNodes: state.setSelectedNodes,
        setSelectedEdges: state.setSelectedEdges,
      })),
    );

  // Handler to update selected node & edges Ids. Note: The passed handler has to be memoized, otherwise the hook will not work correctly
  const updateSelectionState = useCallback(
    ({ nodes, edges }: SelectionType) => {
      setSelectedNodes(nodes.map((node) => node));
      setSelectedEdges(edges.map((edge) => edge));
    },
    [setSelectedEdges, setSelectedNodes],
  );

  // On ReactFlow selection change
  useOnSelectionChange({ onChange: updateSelectionState });

  // Handler to get selected single node
  const getSelectedNode = () => {
    // Return null, if more than one node is selected
    if (selectedNodes.length !== 1) {
      return null;
    }

    // Return selected node
    return selectedNodes[0];
  };

  // Return selected node handler
  return { getSelectedNode };
};

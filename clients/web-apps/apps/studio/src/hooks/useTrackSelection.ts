import { Edge, Node, useOnSelectionChange } from "@xyflow/react";
import { useCallback } from "react";
import { useShallow } from "zustand/react/shallow";

import { useTrackSelectionStore } from "@/stores/track-selection-store";

type SelectionType = {
  nodes: Node[];
  edges: Edge[];
};

/**
 * Keeps track of currently selected node and edges.
 *
 * Note: The hook has to be used in the parent component of the ReactFlow component
 */
export const useTrackSelection = () => {
  // Get TrackSelection store state & actions
  const { setSelectedNodes, setSelectedEdges, setMultipleNodesSelected } = useTrackSelectionStore(
    useShallow((state) => ({
      selectedNodes: state.selectedNodes,
      setSelectedNodes: state.setSelectedNodes,
      setSelectedEdges: state.setSelectedEdges,
      setMultipleNodesSelected: state.setMultipleNodesSelected,
    })),
  );

  // Handler to update selected node & edges Ids. Note: The passed handler has to be memoized, otherwise the hook will not work correctly
  const updateSelectionState = useCallback(
    ({ nodes, edges }: SelectionType) => {
      // Update selected nodes & edges
      setSelectedNodes(nodes.map((node) => node));
      setSelectedEdges(edges.map((edge) => edge));

      // Update multiple nodes selected flag
      setMultipleNodesSelected(nodes.length > 1);
    },
    [setSelectedEdges, setSelectedNodes, setMultipleNodesSelected],
  );

  // On ReactFlow selection change
  useOnSelectionChange({ onChange: updateSelectionState });
};

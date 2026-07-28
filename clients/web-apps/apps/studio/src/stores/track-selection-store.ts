import { Edge, Node } from "@xyflow/react";
import { create } from "zustand";

type State = {
  /** To keep track of selected nodes */
  selectedNodes: Node[];

  /** To keep track of selected edges */
  selectedEdges: Edge[];

  /** A flag to indicate if multiple nodes are selected */
  multipleNodesSelected: boolean;
};

type Actions = {
  /** To update selected nodes */
  setSelectedNodes: (nodes: Node[]) => void;

  /** To update selected edges */
  setSelectedEdges: (edges: Edge[]) => void;

  /** To update multiple nodes selected flag */
  setMultipleNodesSelected: (value: boolean) => void;
};

export const useTrackSelectionStore = create<State & Actions>((set) => ({
  selectedNodes: [],
  selectedEdges: [],
  multipleNodesSelected: false,

  setSelectedNodes: (nodes) =>
    set(() => ({
      selectedNodes: nodes,
    })),

  setSelectedEdges: (edges) =>
    set(() => ({
      selectedEdges: edges,
    })),

  setMultipleNodesSelected: (value) =>
    set(() => ({
      multipleNodesSelected: value,
    })),
}));

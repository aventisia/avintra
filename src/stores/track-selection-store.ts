import { Edge, Node } from "@xyflow/react";
import { create } from "zustand";

type State = {
  /** To keep track of selected nodes */
  selectedNodes: Node[];

  /** To keep track of selected edges */
  selectedEdges: Edge[];
};

type Actions = {
  /** To update selected nodes */
  setSelectedNodes: (nodes: Node[]) => void;

  /** To update selected edges */
  setSelectedEdges: (edges: Edge[]) => void;
};

export const useTrackSelectionStore = create<State & Actions>((set) => ({
  selectedNodes: [],
  selectedEdges: [],

  setSelectedNodes: (nodes) =>
    set(() => ({
      selectedNodes: nodes,
    })),

  setSelectedEdges: (edges) =>
    set(() => ({
      selectedEdges: edges,
    })),
}));

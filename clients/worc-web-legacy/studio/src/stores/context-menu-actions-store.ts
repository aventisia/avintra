import { Edge, Node } from "@xyflow/react";
import { create } from "zustand";

// Define the state type
type State = {
  /** To keep track of the selected node */
  selectedNode: Node | null;

  /** To keep track of the selected node */
  selectedEdge: Edge | null;
};

// Define the actions type
type Actions = {
  /** To select a node */
  setSelectedNode: (node: Node | null) => void;

  /** To select a edge */
  setSelectedEdge: (edge: Edge | null) => void;
};

// Create Zustand store
export const useContextMenuActionsStore = create<State & Actions>((set) => ({
  selectedNode: null,
  selectedEdge: null,

  // Action to set the selected node
  setSelectedNode: (node) => set({ selectedNode: node }),

  // Action to set the selected edge
  setSelectedEdge: (edge) => set({ selectedEdge: edge }),
}));

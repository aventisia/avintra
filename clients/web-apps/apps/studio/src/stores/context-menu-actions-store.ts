import { Edge, Node } from "@xyflow/react";
import { create } from "zustand";

export interface MenuPosition {
  top?: number;
  left?: number;
  right?: number;
  bottom?: number;
}

interface ContextMenuState {
  selectedNode: Node | null;
  selectedEdge: Edge | null;
  menu: MenuPosition | null;
  setSelectedNode: (node: Node | null) => void;
  setSelectedEdge: (edge: Edge | null) => void;
  setMenu: (menu: MenuPosition | null) => void;
}

export const useContextMenuActionsStore = create<ContextMenuState>((set) => ({
  selectedNode: null,
  selectedEdge: null,
  menu: null,
  setSelectedNode: (node) => set({ selectedNode: node }),
  setSelectedEdge: (edge) => set({ selectedEdge: edge }),
  setMenu: (menu) => set({ menu }),
}));

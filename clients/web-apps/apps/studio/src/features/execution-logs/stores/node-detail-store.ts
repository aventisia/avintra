import { create } from "zustand";

/**
 * Tracks which node's execution log is open in the node-detail panel.
 *
 * Replaces the previous hover popover: the log is now shown in a docked panel so it stays
 * open while the user inspects values.
 */
interface NodeDetailState {
  /** Node whose log is being inspected, or null when the panel is closed. */
  selectedNodeId: string | null;

  openNodeDetail: (nodeId: string) => void;
  closeNodeDetail: () => void;
}

export const useNodeDetailStore = create<NodeDetailState>((set) => ({
  selectedNodeId: null,

  openNodeDetail: (nodeId) => set({ selectedNodeId: nodeId }),
  closeNodeDetail: () => set({ selectedNodeId: null }),
}));

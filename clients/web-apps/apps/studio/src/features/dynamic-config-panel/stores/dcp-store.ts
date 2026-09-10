import { create } from "zustand";

import { NodeDataType } from "@/types/node-data-type";

// Non-modal drawer id for the dynamic config panel. Closing happens only via
// explicit actions (X / Escape / Save) — never on outside click since there is
// no overlay.
export const DCP_PANEL_ID = "dcp-config-panel";

type State = {
  showDialog: boolean;
  showViewer: boolean;
  nodeId?: string;
  nodeData?: NodeDataType;
  nodeLabel?: string;
  selectedTab: string;
  /** True while the open config form has unsaved edits (published by the forms). */
  isFormDirty: boolean;
};

type Actions = {
  setShowDialog: (showDialog: boolean) => void;
  setShowViewer: (showDialog: boolean) => void;
  setNodeId: (nodeId: string) => void;
  setNodeData: (nodeData: NodeDataType) => void;
  setNodeLabel: (label: string) => void;
  setSelectedTab: (selectedTab: string) => void;
  setIsFormDirty: (isFormDirty: boolean) => void;
  /** Unified open: point the panel at a node and open it (never toggles). */
  openNodeConfig: (nodeId: string, nodeData: NodeDataType) => void;
  /** Unified close: hides the panel, keeps node context for reopen. */
  closeNodeConfig: () => void;
};

const useDynamicConfigPanelStore = create<State & Actions>((set) => ({
  showDialog: false,
  showViewer: false,
  selectedTab: "",
  isFormDirty: false,
  setShowDialog: (showDialog) => set({ showDialog }),
  setShowViewer: (showViewer) => set({ showViewer }),
  setNodeId: (nodeId) => set({ nodeId }),
  setNodeData: (nodeData) =>
    set({
      nodeData,
      nodeLabel: nodeData.label, // Automatically extract label
    }),
  setNodeLabel: (label) => set({ nodeLabel: label }),
  setSelectedTab: (label) => set({ selectedTab: label }),
  setIsFormDirty: (isFormDirty) => set({ isFormDirty }),
  openNodeConfig: (nodeId, nodeData) =>
    set({
      nodeId,
      nodeData,
      nodeLabel: nodeData.label, // Automatically extract label
      showDialog: true,
    }),
  closeNodeConfig: () => set({ showDialog: false }),
}));

export { useDynamicConfigPanelStore };

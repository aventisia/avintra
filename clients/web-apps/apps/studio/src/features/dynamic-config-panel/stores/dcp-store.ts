import { create } from "zustand";

import { NodeDataType } from "@/types/node-data-type";

import type { FlushFormFn } from "../hooks/useFlushNodeConfig";

// Non-modal drawer id for the dynamic config panel. Closing happens only via
// explicit actions (X / Escape / node switch) — never on outside click since
// there is no overlay.
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
  /**
   * Commits the open config form into the canvas store. Registered by the active form.
   *
   * IMPORTANT NOTE: single slot — only one form is active at a time. The flush
   * always persists, including incomplete/invalid edits, so the user can close
   * the panel and resume later.
   */
  flushForm?: FlushFormFn;
  /**
   * Commits in-progress edits held inside composite fields (e.g. the Tools
   * builder). Called by flushForm before it snapshots the form. Returns true
   * when it committed something.
   */
  flushPendingFieldEdits?: () => boolean;
};

type Actions = {
  setShowDialog: (showDialog: boolean) => void;
  setShowViewer: (showDialog: boolean) => void;
  setNodeId: (nodeId: string) => void;
  setNodeData: (nodeData: NodeDataType) => void;
  setNodeLabel: (label: string) => void;
  setSelectedTab: (selectedTab: string) => void;
  setIsFormDirty: (isFormDirty: boolean) => void;
  setFlushForm: (flushForm?: FlushFormFn) => void;
  setFlushPendingFieldEdits: (flushPendingFieldEdits?: () => boolean) => void;
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
  flushForm: undefined,
  flushPendingFieldEdits: undefined,
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
  setFlushForm: (flushForm) => set({ flushForm }),
  setFlushPendingFieldEdits: (flushPendingFieldEdits) => set({ flushPendingFieldEdits }),
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

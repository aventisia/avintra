import { NodeDataType } from "@/types/node-data-type";

import { create } from "zustand";

type State = {
  showDialog: boolean;
  nodeId?: string;
  nodeData?: NodeDataType;
  nodeLabel?: string;
  selectedTab: string;
};

type Actions = {
  setShowDialog: (showDialog: boolean) => void;
  setNodeId: (nodeId: string) => void;
  setNodeData: (nodeData: NodeDataType) => void;
  setNodeLabel: (label: string) => void;
  setSelectedTab: (selectedTab: string) => void;
};

const useDynamicConfigPanelStore = create<State & Actions>((set) => ({
  showDialog: false,
  selectedTab: "",
  setShowDialog: (showDialog) => set({ showDialog }),
  setNodeId: (nodeId) => set({ nodeId }),
  setNodeData: (nodeData) =>
    set({
      nodeData,
      nodeLabel: nodeData.label, // ✅ Automatically extract label
    }),
  setNodeLabel: (label) => set({ nodeLabel: label }),
  setSelectedTab: (label) => set({ selectedTab: label }),
}));

export { useDynamicConfigPanelStore };

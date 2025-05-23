import { NodeDataType } from "@/types/node-data-type";
import { create } from "zustand";

type State = {
  showDialog: boolean;
  nodeId?: string;
  nodeData?: NodeDataType;
};

type Actions = {
  setShowDialog: (showDialog: boolean) => void;
  setNodeId: (nodeId: string) => void;
  setNodeData: (nodeData: NodeDataType) => void;
};

const useDynamicConfigPanelStore = create<State & Actions>((set) => ({
  showDialog: false,

  setShowDialog: (showDialog) => set({ showDialog }),
  setNodeId: (nodeId) => set({ nodeId }),
  setNodeData: (nodeData) => set({ nodeData }),
}));

export { useDynamicConfigPanelStore };

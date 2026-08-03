import { Edge, Node } from "@xyflow/react";
import { create } from "zustand";

type State = {
  groupId: string;
  flowBlockObject: {
    nodes: Node[];
    edges: Edge[];
  };
};

type Actions = {
  setGroupId: (groupId: string) => void;
  setFlowBlockObject: (flowBlockObject: { nodes: Node[]; edges: Edge[] }) => void;
};

const useFlowBlockStore = create<State & Actions>((set) => ({
  flowBlockObject: { edges: [], nodes: [] },
  groupId: "",
  setGroupId: (groupId) => set({ groupId }),
  setFlowBlockObject: (flowBlockObject) => set({ flowBlockObject }),
}));

export { useFlowBlockStore };

import { FlowVariablesObjectType } from "@/types/flow-variables-object-type";
import { Edge, Node, Viewport } from "@xyflow/react";
import { create } from "zustand";

type State = {
  /** Nodes of currently opened flow */
  nodes: Node[];

  /** Edges of currently opened flow */
  edges: Edge[];

  /** Output flow variables */
  flowVariablesObject: FlowVariablesObjectType[] | [];

  /** Flow Viewport */
  viewport: Viewport;

  name: string;
};

type Actions = {
  /** Set nodes of currently opened flow */
  setNodes: (nodes: Node[]) => void;

  /** Set edges of currently opened flow */
  setEdges: (edges: Edge[]) => void;

  /** Set Flow Variables */
  setFlowVariablesObject: (variables: FlowVariablesObjectType[]) => void;

  /** Set viewport */
  setViewport: (viewport: Viewport) => void;

  setName: (name: string) => void;
};

export const useReactFlowViewStore = create<State & Actions>((set) => ({
  nodes: [],
  edges: [],
  flowVariablesObject: [],
  viewport: { x: 0, y: 0, zoom: 1 },
  name: "",

  setNodes: (nodes: Node[]) => set({ nodes }),
  setEdges: (edges: Edge[]) => set({ edges }),
  setFlowVariablesObject: (variables: FlowVariablesObjectType[]) =>
    set({ flowVariablesObject: variables }),
  setViewport: (viewport) => set({ viewport }),
  setName: (name) => set({ name }),
}));

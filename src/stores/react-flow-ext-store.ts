import { create } from "zustand";
import {
  Connection,
  Edge,
  EdgeChange,
  Node,
  NodeChange,
  addEdge,
  OnNodesChange,
  OnEdgesChange,
  OnConnect,
  applyNodeChanges,
  applyEdgeChanges,
} from "@xyflow/react";

type State = {
  /** Nodes of currently opened flow */
  nodes: Node[];

  /** Edges of currently opened flow */
  edges: Edge[];

  /** Flag to track if Reactflow is locked */
  isLocked: boolean;
};

type Actions = {
  /** Handler to handle node changes */
  onNodesChange: OnNodesChange;

  /** Handler to handle edge changes */
  onEdgesChange: OnEdgesChange;

  /** Handler to handle node connection */
  onConnect: OnConnect;

  /** Set nodes of currently opened flow */
  setNodes: (nodes: Node[]) => void;

  /** Set edges of currently opened flow */
  setEdges: (edges: Edge[]) => void;

  /** To toggle ReactFlow lock/unlock state */
  toggleIsLocked: (isLocked: boolean) => void;
};

export const useReactFlowExtStore = create<State & Actions>((set, get) => ({
  nodes: [],
  edges: [],
  isLocked: false,

  onNodesChange: (changes: NodeChange[]) => {
    set({ nodes: applyNodeChanges(changes, get().nodes) });
  },

  onEdgesChange: (changes: EdgeChange[]) => {
    set({ edges: applyEdgeChanges(changes, get().edges) });
  },

  onConnect: (connection: Connection) => {
    set({ edges: addEdge(connection, get().edges) });
  },

  setNodes: (nodes: Node[]) => {
    set({ nodes });
  },

  setEdges: (edges: Edge[]) => {
    set({ edges });
  },

  toggleIsLocked: (value) =>
    set((state) => ({
      isLocked: typeof value === "boolean" ? value : !state.isLocked,
    })),
}));

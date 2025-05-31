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
import { FlowVariablesObjectType } from "@/types/flow-variables-object-type";
import { MARKER_ARROW_PREFIX } from "@/constants";

type State = {
  /** Nodes of currently opened flow */
  nodes: Node[];

  /** Edges of currently opened flow */
  edges: Edge[];

  /** Flag to track if Reactflow is locked */
  isLocked: boolean;

  /** Flag to track if Reactflow is published */
  isPublished: boolean;

  /** Output flow variables */
  flowVariablesObject: FlowVariablesObjectType[] | [];

  /** Flag to track pending flow save */
  isSavePending: boolean;

  /** Origin of context menu. null means menu is closed */
  contextMenuOrigin: "Node" | "Edge" | "Pane" | "Selection" | null;
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

  /** Set Flow Vairables */
  setFlowVariablesObject: (variabels: FlowVariablesObjectType[]) => void;

  /** To toggle ReactFlow lock/unlock state */
  toggleIsLocked: (isLocked: boolean) => void;

  /** To toggle ReactFlow publish state */
  setIsPublished: (isPublished: boolean) => void;

  /** Set flag to track pending flow save */
  setIsSavePending: (isSavePending: boolean) => void;

  /** Set context menu origin */
  setContextMenuOrigin: (
    origin: "Node" | "Edge" | "Pane" | "Selection" | null,
  ) => void;
};

export const useReactFlowExtStore = create<State & Actions>((set, get) => ({
  nodes: [],
  edges: [],
  flowVariablesObject: [],
  isLocked: false,
  isSavePending: false,
  contextMenuOrigin: null,
  isPublished: false,

  onNodesChange: (changes: NodeChange[]) => {
    set({
      isSavePending: true,
      nodes: applyNodeChanges(changes, get().nodes),
    });
  },

  onEdgesChange: (changes: EdgeChange[]) => {
    set({
      isSavePending: true,
      edges: applyEdgeChanges(changes, get().edges),
    });
  },

  //onConnect triggers only when two nodes are connected manually
  onConnect: (connection: Connection) => {
    // Create a unique id for the edge
    const id = window.crypto.randomUUID();

    set({
      isSavePending: true,
      edges: addEdge(
        {
          ...connection,
          label: "plus",
          id,
          markerEnd: `${MARKER_ARROW_PREFIX}${id}`,
        },
        get().edges,
      ),
    });
  },

  setNodes: (nodes: Node[]) => {
    set({ isSavePending: true, nodes });
  },

  setIsPublished: (isPublished: boolean) => {
    set({ isPublished });
  },

  setEdges: (edges: Edge[]) => {
    set({ isSavePending: true, edges });
  },

  setFlowVariablesObject: (variables: FlowVariablesObjectType[]) => {
    set({ flowVariablesObject: variables });
  },

  toggleIsLocked: (value) => {
    set((state) => ({
      isLocked: typeof value === "boolean" ? value : !state.isLocked,
    }));
  },

  setIsSavePending: (isSavePending: boolean) => {
    set({ isSavePending });
  },

  setContextMenuOrigin: (contextMenuOrigin) => {
    set({ contextMenuOrigin });
  },
}));

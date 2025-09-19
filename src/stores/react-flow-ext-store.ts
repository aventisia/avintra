import { MARKER_ARROW_PREFIX } from "@/constants";
import { DCPFieldSchemaType } from "@/features/dynamic-config-panel";
import { FlowVariablesObjectType } from "@/types/flow-variables-object-type";
import {
  Connection,
  Edge,
  EdgeChange,
  Node,
  NodeChange,
  OnConnect,
  OnEdgesChange,
  OnNodesChange,
  Viewport,
  addEdge,
  applyEdgeChanges,
  applyNodeChanges,
} from "@xyflow/react";
import { create } from "zustand";

type State = {
  /** Nodes of currently opened flow */
  nodes: Node[];

  /** Edges of currently opened flow */
  edges: Edge[];

  /** Flag to indicate if ReactFlow pan can be dragged or not */
  panOnDrag: boolean;

  /** Flag to track if Reactflow is published */
  isPublished: boolean;

  /** Output flow variables */
  flowVariablesObject: FlowVariablesObjectType[] | [];

  /** Input output json */
  inputOutputObject: DCPFieldSchemaType[] | [];

  /** Flag to track pending flow save */
  isSavePending: boolean;

  /** Origin of context menu. null means menu is closed */
  contextMenuOrigin: "Node" | "Edge" | "Pane" | "Selection" | null;

  /** Flow Viewport */
  viewport: Viewport;
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

  /**Set InputOutput json */
  setInputOutputObject: (inputOutputObject: DCPFieldSchemaType[]) => void;

  /** Toggle arrow / grab handle of ReactFlow */
  togglePanOnDrag: (panOnDrag: boolean) => void;

  /** To toggle ReactFlow publish state */
  setIsPublished: (isPublished: boolean) => void;

  /** Set flag to track pending flow save */
  setIsSavePending: (isSavePending: boolean) => void;

  /** Set viewport */
  setViewport: (viewport: Viewport) => void;

  /** Set context menu origin */
  setContextMenuOrigin: (
    origin: "Node" | "Edge" | "Pane" | "Selection" | null,
  ) => void;
};

export const useReactFlowExtStore = create<State & Actions>((set, get) => ({
  nodes: [],
  edges: [],
  flowVariablesObject: [],
  inputOutputObject: [],
  panOnDrag: false,
  isSavePending: false,
  contextMenuOrigin: null,
  isPublished: false,
  viewport: { x: 0, y: 0, zoom: 1 },

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

  setInputOutputObject: (inputOutputObject: DCPFieldSchemaType[]) => {
    set({ inputOutputObject });
  },

  togglePanOnDrag: (value) => {
    set((state) => ({
      panOnDrag: typeof value === "boolean" ? value : !state.panOnDrag,
    }));
  },

  setIsSavePending: (isSavePending: boolean) => {
    set({ isSavePending });
  },

  setContextMenuOrigin: (contextMenuOrigin) => {
    set({ contextMenuOrigin });
  },

  setViewport: (viewport) => {
    set({ viewport });
  },
}));

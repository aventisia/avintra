import { MARKER_ARROW_PREFIX } from "@/constants";
import { DCPFieldSchemaType } from "@/features/dynamic-config-panel";
import { FlowTypesEnum } from "@avplatform/ui/enums";
import { FlowVariablesObjectType } from "@/types/flow-variables-object-type";
import { HistoryState } from "@/utils/history-equality-checker";

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
import { subscribeWithSelector } from "zustand/middleware";

const MAX_HISTORY_STEPS = 100;

type State = {
  /** Nodes of currently opened flow */
  nodes: Node[];

  /** Edges of currently opened flow */
  edges: Edge[];

  /** Flag to indicate if ReactFlow pan can be dragged or not */
  panOnDrag: boolean;

  /** Flag to track if flow is published */
  isPublished: boolean;

  /** Type of the flow - Agent, ChatAgent or Block. TODO: we can combine flow meta data like isPublished and flowType into a single object */
  flowType: FlowTypesEnum;

  isTestChatOpen: boolean;

  /** Output flow variables */
  flowVariablesObject: FlowVariablesObjectType[] | [];

  /** Config variables */
  configVariables: string[] | [];

  /** Input output json */
  inputOutputObject: DCPFieldSchemaType[] | [];

  /** Flag to track pending flow save */
  isSavePending: boolean;

  /** Origin of context menu. null means menu is closed */
  contextMenuOrigin: "Node" | "Edge" | "Pane" | "Selection" | null;

  /** Flow Viewport */
  viewport: Viewport;

  past: HistoryState[];
  future: HistoryState[];
  isRestoringHistory: boolean;
  savedSnapshot: HistoryState | null;
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

  /** Set Flow Variables */
  setFlowVariablesObject: (variables: FlowVariablesObjectType[]) => void;

  /** Set Config Variables */
  setConfigVariables: (variables: string[]) => void;

  /**Set InputOutput json */
  setInputOutputObject: (inputOutputObject: DCPFieldSchemaType[]) => void;

  /** Toggle arrow / grab handle of ReactFlow */
  togglePanOnDrag: (panOnDrag: boolean) => void;

  /** To toggle ReactFlow publish state */
  setIsPublished: (isPublished: boolean) => void;

  /** To set flow type */
  setFlowType: (flowType: FlowTypesEnum) => void;

  /** To toggle test chat state */
  setIsTestChatOpen: (isTestChatOpen: boolean) => void;

  /** Set flag to track pending flow save */
  setIsSavePending: (isSavePending: boolean) => void;

  /** Set viewport */
  setViewport: (viewport: Viewport) => void;

  /** Set context menu origin */
  setContextMenuOrigin: (
    origin: "Node" | "Edge" | "Pane" | "Selection" | null,
  ) => void;

  hydrateFlow: (
    nodes: Node[],
    edges: Edge[],
    variables: FlowVariablesObjectType[],
  ) => void;
  setSavedSnapshot: (snapshot: HistoryState) => void;
  commitSnapshot: (snapshot: HistoryState) => void;
  undo: () => void;
  redo: () => void;
};

export const useReactFlowExtStore = create<State & Actions>()(
  subscribeWithSelector((set, get) => ({
    nodes: [],
    edges: [],
    flowVariablesObject: [],
    configVariables: [],
    inputOutputObject: [],
    panOnDrag: true,
    isSavePending: false,
    contextMenuOrigin: null,
    isPublished: false,
    flowType: FlowTypesEnum.Agent,
    isTestChatOpen: false,
    viewport: { x: 0, y: 0, zoom: 1 },

    past: [],
    future: [],
    isRestoringHistory: false,
    savedSnapshot: null,

    onNodesChange: (changes: NodeChange[]) => {
      set({ nodes: applyNodeChanges(changes, get().nodes) });
    },

    onEdgesChange: (changes: EdgeChange[]) => {
      set({ edges: applyEdgeChanges(changes, get().edges) });
    },

    //onConnect triggers only when two nodes are connected manually
    onConnect: (connection: Connection) => {
      // Create a unique id for the edge
      const id = window.crypto.randomUUID();
      set({
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

    setNodes: (nodes: Node[]) => set({ nodes }),
    setEdges: (edges: Edge[]) => set({ edges }),
    setIsPublished: (isPublished: boolean) => set({ isPublished }),
    setFlowType: (flowType: FlowTypesEnum) =>
      set({ flowType, isTestChatOpen: false }),
    setIsTestChatOpen: (isTestChatOpen: boolean) => set({ isTestChatOpen }),
    setFlowVariablesObject: (variables: FlowVariablesObjectType[]) =>
      set({ flowVariablesObject: variables }),
    setConfigVariables: (variables: string[]) =>
      set({ configVariables: variables }),
    setInputOutputObject: (inputOutputObject: DCPFieldSchemaType[]) =>
      set({ inputOutputObject }),
    togglePanOnDrag: (value) =>
      set((state) => ({
        panOnDrag: typeof value === "boolean" ? value : !state.panOnDrag,
      })),
    setIsSavePending: (isSavePending: boolean) => set({ isSavePending }),
    setContextMenuOrigin: (contextMenuOrigin) => set({ contextMenuOrigin }),
    setViewport: (viewport) => set({ viewport }),

    hydrateFlow: (nodes, edges, variables) => {
      const baseline: HistoryState = {
        nodes,
        edges,
        flowVariablesObject: variables,
      };
      set({
        nodes,
        edges,
        flowVariablesObject: variables,
        past: [baseline],
        future: [],
        savedSnapshot: baseline,
        isSavePending: false,
      });
    },

    setSavedSnapshot: (snapshot) => {
      set({ savedSnapshot: snapshot, isSavePending: false });
    },

    commitSnapshot: (snapshot) => {
      set((state) => {
        const newPast = [...state.past, snapshot];
        if (newPast.length > MAX_HISTORY_STEPS) newPast.shift();
        return { past: newPast, future: [] };
      });
    },

    undo: () => {
      set((state) => {
        if (state.past.length < 2) return state;

        const previousState = state.past[state.past.length - 2];
        const currentStateObj: HistoryState = {
          nodes: state.nodes,
          edges: state.edges,
          flowVariablesObject: state.flowVariablesObject,
        };

        return {
          past: state.past.slice(0, -1),
          future: [currentStateObj, ...state.future],
          nodes: previousState.nodes,
          edges: previousState.edges,
          flowVariablesObject: previousState.flowVariablesObject,
          isRestoringHistory: true,
        };
      });
    },

    redo: () => {
      set((state) => {
        if (state.future.length === 0) return state;

        const nextState = state.future[0];

        return {
          past: [...state.past, nextState],
          future: state.future.slice(1),
          nodes: nextState.nodes,
          edges: nextState.edges,
          flowVariablesObject: nextState.flowVariablesObject,
          isRestoringHistory: true,
        };
      });
    },
  })),
);

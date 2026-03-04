import { MARKER_ARROW_PREFIX } from "@/constants";
import { DCPFieldSchemaType } from "@/features/dynamic-config-panel";
import { FlowVariablesObjectType } from "@/types/flow-variables-object-type";
import { HistoryState, isHistoryEqual } from "@/utils/history-equality-checker";
import {
  isSignificantNodeChange,
  isSignificantEdgeChange,
} from "@/utils/history-filters";
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

const MAX_HISTORY_STEPS = 100;

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

export const useReactFlowExtStore = create<State & Actions>((set, get) => ({
  nodes: [],
  edges: [],
  flowVariablesObject: [],
  configVariables: [],
  inputOutputObject: [],
  panOnDrag: false,
  isSavePending: false,
  contextMenuOrigin: null,
  isPublished: false,
  viewport: { x: 0, y: 0, zoom: 1 },

  past: [],
  future: [],
  isRestoringHistory: false,
  savedSnapshot: null,

  onNodesChange: (changes: NodeChange[]) => {
    const state = get();
    const nextNodes = applyNodeChanges(changes, state.nodes);

    // Intercept changes: Only push to history if it is a significant change (e.g., node dropped)
    // and we are not currently running an undo/redo operation.
    if (!state.isRestoringHistory && isSignificantNodeChange(changes)) {
      state.commitSnapshot({
        nodes: nextNodes,
        edges: state.edges,
        flowVariablesObject: state.flowVariablesObject,
      });
    }

    // Apply nodes and ensure the restoring lock is released for subsequent actions
    set({ nodes: nextNodes, isRestoringHistory: false });
  },

  onEdgesChange: (changes: EdgeChange[]) => {
    const state = get();
    const nextEdges = applyEdgeChanges(changes, state.edges);

    // Intercept changes: Only push to history if it is a significant change (e.g., edge deleted)
    if (!state.isRestoringHistory && isSignificantEdgeChange(changes)) {
      state.commitSnapshot({
        nodes: state.nodes,
        edges: nextEdges,
        flowVariablesObject: state.flowVariablesObject,
      });
    }

    // Apply edges and release the restoring lock
    set({ edges: nextEdges, isRestoringHistory: false });
  },

  //onConnect triggers only when two nodes are connected manually
  onConnect: (connection: Connection) => {
    const id = window.crypto.randomUUID();
    const state = get();

    // Explicitly define the type as Edge so TypeScript does not narrow the generic inference
    const newEdge: Edge = {
      ...connection,
      label: "plus",
      id,
      markerEnd: `${MARKER_ARROW_PREFIX}${id}`,
    };

    // addEdge will now correctly infer T as Edge, matching state.edges
    const nextEdges = addEdge(newEdge, state.edges);

    if (!state.isRestoringHistory) {
      state.commitSnapshot({
        nodes: state.nodes,
        edges: nextEdges,
        flowVariablesObject: state.flowVariablesObject,
      });
    }

    set({ edges: nextEdges });
  },
  setNodes: (nodes: Node[]) => set({ nodes }),
  setEdges: (edges: Edge[]) => set({ edges }),
  setIsPublished: (isPublished: boolean) => set({ isPublished }),

  setFlowVariablesObject: (variables: FlowVariablesObjectType[]) => {
    const state = get();

    // Intercepting direct sets ensures flow variables can be undone/redone perfectly
    if (!state.isRestoringHistory) {
      state.commitSnapshot({
        nodes: state.nodes,
        edges: state.edges,
        flowVariablesObject: variables,
      });
    }
    set({ flowVariablesObject: variables });
  },

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
      // Guard: Do not push a duplicate state if it exactly matches the latest history step
      const lastHistoryState =
        state.past.length > 0 ? state.past[state.past.length - 1] : null;
      if (lastHistoryState && isHistoryEqual(lastHistoryState, snapshot)) {
        return state;
      }

      const newPast = [...state.past, snapshot];
      if (newPast.length > MAX_HISTORY_STEPS) newPast.shift();

      // Dynamically calculate if the canvas has drifted from the last DB save
      let isPending = true;
      if (state.savedSnapshot) {
        isPending = !isHistoryEqual(state.savedSnapshot, snapshot);
      }

      return { past: newPast, future: [], isSavePending: isPending };
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

      // Check if undoing brought the user perfectly back to the last saved DB state
      let isPending = true;
      if (state.savedSnapshot) {
        isPending = !isHistoryEqual(state.savedSnapshot, previousState);
      }

      return {
        past: state.past.slice(0, -1),
        future: [currentStateObj, ...state.future],
        nodes: previousState.nodes,
        edges: previousState.edges,
        flowVariablesObject: previousState.flowVariablesObject,
        isRestoringHistory: true, // Activate history lock to prevent onNodesChange from saving this action
        isSavePending: isPending,
      };
    });
  },

  redo: () => {
    set((state) => {
      if (state.future.length === 0) return state;

      const nextState = state.future[0];

      // Check if redoing brought the user perfectly back to the last saved DB state
      let isPending = true;
      if (state.savedSnapshot) {
        isPending = !isHistoryEqual(state.savedSnapshot, nextState);
      }

      return {
        past: [...state.past, nextState],
        future: state.future.slice(1),
        nodes: nextState.nodes,
        edges: nextState.edges,
        flowVariablesObject: nextState.flowVariablesObject,
        isRestoringHistory: true, // Activate history lock to prevent onNodesChange from saving this action
        isSavePending: isPending,
      };
    });
  },
}));

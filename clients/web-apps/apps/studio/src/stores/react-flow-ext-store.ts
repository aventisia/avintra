import { FlowTypesEnum } from "@avplatform/ui/enums";
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

import { MARKER_ARROW_PREFIX } from "@/constants";
import { DCPFieldSchemaType } from "@/features/dynamic-config-panel";
import { notifyChatAgentActionNotAllowed } from "@/features/react-flow/utils/chat-agent-action.util";
import { normalizeChatAgentGraph } from "@/features/react-flow/utils/chat-agent-graph.util";
import { FlowVariablesObjectType } from "@/types/flow-variables-object-type";
import { HistoryState } from "@/utils/history-equality-checker";

const MAX_HISTORY_STEPS = 100;

// ─── Collaboration broadcast plumbing ───────────────────────────────────────
// The collaboration hook registers these callbacks so the store can broadcast
// local node/edge edits to other collaborators. They are module-level to avoid
// circular imports between the store and the collaboration feature.
type BroadcastNodeChangeFn = (nodeId: string, node: string) => void;
type BroadcastEdgeChangeFn = (edgeId: string, edge: string) => void;
type BroadcastGraphChangeFn = (nodes: string, edges: string) => void;

let broadcastNodeChangeFn: BroadcastNodeChangeFn | null = null;
let broadcastEdgeChangeFn: BroadcastEdgeChangeFn | null = null;
let broadcastGraphChangeFn: BroadcastGraphChangeFn | null = null;

export const setCollaborationBroadcasters = (
  nodeFn: BroadcastNodeChangeFn | null,
  edgeFn: BroadcastEdgeChangeFn | null,
  graphFn?: BroadcastGraphChangeFn | null,
) => {
  broadcastNodeChangeFn = nodeFn;
  broadcastEdgeChangeFn = edgeFn;
  broadcastGraphChangeFn = graphFn ?? null;
};

// Throttle broadcasts to avoid flooding the hub during drags/typing.
let nodeBroadcastTimer: ReturnType<typeof setTimeout> | null = null;
let edgeBroadcastTimer: ReturnType<typeof setTimeout> | null = null;
let pendingNodeId: string | null = null;
let pendingNodeJson: string | null = null;
let pendingEdgeId: string | null = null;
let pendingEdgeJson: string | null = null;

const scheduleNodeBroadcast = (nodeId: string, nodeJson: string) => {
  pendingNodeId = nodeId;
  pendingNodeJson = nodeJson;
  if (nodeBroadcastTimer) return;
  nodeBroadcastTimer = setTimeout(() => {
    nodeBroadcastTimer = null;
    if (broadcastNodeChangeFn && pendingNodeId && pendingNodeJson) {
      broadcastNodeChangeFn(pendingNodeId, pendingNodeJson);
    }
    pendingNodeId = null;
    pendingNodeJson = null;
  }, 100);
};

const scheduleEdgeBroadcast = (edgeId: string, edgeJson: string) => {
  pendingEdgeId = edgeId;
  pendingEdgeJson = edgeJson;
  if (edgeBroadcastTimer) return;
  edgeBroadcastTimer = setTimeout(() => {
    edgeBroadcastTimer = null;
    if (broadcastEdgeChangeFn && pendingEdgeId && pendingEdgeJson) {
      broadcastEdgeChangeFn(pendingEdgeId, pendingEdgeJson);
    }
    pendingEdgeId = null;
    pendingEdgeJson = null;
  }, 100);
};

/**
 * Broadcasts the current node with the given id to other collaborators. Used when
 * node data is updated outside the normal onNodesChange path (e.g. the config panel
 * via React Flow's updateNodeData). Reads the freshest node from the store.
 */
export const broadcastNodeUpdate = (nodeId: string) => {
  const node = useReactFlowExtStore.getState().nodes.find((n) => n.id === nodeId);
  if (node) scheduleNodeBroadcast(node.id, JSON.stringify(node));
};

// Throttle full-graph broadcasts for structural changes.
let graphBroadcastTimer: ReturnType<typeof setTimeout> | null = null;

const broadcastGraphChange = () => {
  if (graphBroadcastTimer) return;
  graphBroadcastTimer = setTimeout(() => {
    graphBroadcastTimer = null;
    if (!broadcastGraphChangeFn) return;
    const { nodes, edges } = useReactFlowExtStore.getState();
    broadcastGraphChangeFn(JSON.stringify(nodes), JSON.stringify(edges));
  }, 120);
};

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

  /** True while a remote collaboration edit is being applied, so local changes
   *  are not re-broadcast and undo/redo history is not polluted. */
  isApplyingRemote: boolean;
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

  /** Set flag to track pending flow save */
  setIsSavePending: (isSavePending: boolean) => void;

  /** Set viewport */
  setViewport: (viewport: Viewport) => void;

  /** Set context menu origin */
  setContextMenuOrigin: (origin: "Node" | "Edge" | "Pane" | "Selection" | null) => void;

  hydrateFlow: (nodes: Node[], edges: Edge[], variables: FlowVariablesObjectType[]) => void;
  setSavedSnapshot: (snapshot: HistoryState) => void;
  commitSnapshot: (snapshot: HistoryState) => void;
  undo: () => void;
  redo: () => void;
  setIsApplyingRemote: (isApplyingRemote: boolean) => void;
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
    viewport: { x: 0, y: 0, zoom: 1 },

    past: [],
    future: [],
    isRestoringHistory: false,
    savedSnapshot: null,
    isApplyingRemote: false,

    onNodesChange: (changes: NodeChange[]) => {
      const nextNodes = applyNodeChanges(changes, get().nodes);
      set({ nodes: nextNodes });

      // Broadcast structural/position changes to collaborators (skip remote-originated).
      if (!get().isApplyingRemote) {
        const changed = changes.find((c) => c.type === "position" || c.type === "remove");
        if (changed && "id" in changed) {
          const node = nextNodes.find((n) => n.id === changed.id);
          if (node) scheduleNodeBroadcast(node.id, JSON.stringify(node));
        }
      }
    },

    onEdgesChange: (changes: EdgeChange[]) => {
      const nextEdges = applyEdgeChanges(changes, get().edges);
      set({ edges: nextEdges });

      if (!get().isApplyingRemote) {
        const changed = changes.find((c) => c.type === "remove");
        if (changed && "id" in changed) {
          scheduleEdgeBroadcast(changed.id, JSON.stringify({ id: changed.id, removed: true }));
        }
      }
    },

    //onConnect triggers only when two nodes are connected manually
    onConnect: (connection: Connection) => {
      if (get().flowType === FlowTypesEnum.ChatAgent) {
        notifyChatAgentActionNotAllowed();
        return;
      }

      // Create a unique id for the edge
      const id = window.crypto.randomUUID();
      const newEdge = {
        ...connection,
        label: "plus",
        id,
        markerEnd: `${MARKER_ARROW_PREFIX}${id}`,
      } as Edge;
      set({
        edges: addEdge(newEdge, get().edges),
      });

      if (!get().isApplyingRemote) {
        scheduleEdgeBroadcast(id, JSON.stringify(newEdge));
      }
    },

    setNodes: (nodes: Node[]) => {
      const prevNodes = get().nodes;
      set({ nodes });

      // Broadcast a full-graph snapshot on structural changes (nodes added/removed), since
      // dagre auto-layout repositions the whole graph. Skip remote-originated changes.
      if (!get().isApplyingRemote && broadcastGraphChangeFn) {
        const prevIds = new Set(prevNodes.map((n) => n.id));
        const hasStructuralChange =
          nodes.length !== prevNodes.length ||
          nodes.some((n) => !prevIds.has(n.id)) ||
          prevNodes.some((n) => !nodes.some((nn) => nn.id === n.id));
        if (hasStructuralChange) {
          broadcastGraphChange();
        }
      }
    },
    setEdges: (edges: Edge[]) => {
      const prevEdges = get().edges;
      set({ edges });

      // Broadcast a full-graph snapshot when edges are added/removed structurally.
      if (!get().isApplyingRemote && broadcastGraphChangeFn) {
        const prevIds = new Set(prevEdges.map((e) => e.id));
        const hasStructuralChange =
          edges.length !== prevEdges.length ||
          edges.some((e) => !prevIds.has(e.id)) ||
          prevEdges.some((e) => !edges.some((ee) => ee.id === e.id));
        if (hasStructuralChange) {
          broadcastGraphChange();
        }
      }
    },
    setIsPublished: (isPublished: boolean) => set({ isPublished }),
    setFlowType: (flowType: FlowTypesEnum) => set({ flowType }),
    setFlowVariablesObject: (variables: FlowVariablesObjectType[]) =>
      set({ flowVariablesObject: variables }),
    setConfigVariables: (variables: string[]) => set({ configVariables: variables }),
    setInputOutputObject: (inputOutputObject: DCPFieldSchemaType[]) => set({ inputOutputObject }),
    togglePanOnDrag: (value) =>
      set((state) => ({
        panOnDrag: typeof value === "boolean" ? value : !state.panOnDrag,
      })),
    setIsSavePending: (isSavePending: boolean) => set({ isSavePending }),
    setContextMenuOrigin: (contextMenuOrigin) => set({ contextMenuOrigin }),
    setViewport: (viewport) => set({ viewport }),

    hydrateFlow: (nodes, edges, variables) => {
      const graph =
        get().flowType === FlowTypesEnum.ChatAgent
          ? normalizeChatAgentGraph(nodes, edges)
          : { nodes, edges, flowVariablesObject: variables };
      const baseline: HistoryState = {
        nodes: graph.nodes,
        edges: graph.edges,
        flowVariablesObject: graph.flowVariablesObject,
      };
      set({
        nodes: graph.nodes,
        edges: graph.edges,
        flowVariablesObject: graph.flowVariablesObject,
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
      // Undo changes the whole graph structure; broadcast a full-graph snapshot to
      // collaborators so they stay in sync. Skip when applying a remote change.
      if (!get().isApplyingRemote) broadcastGraphChange();
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
      // Redo changes the whole graph structure; broadcast a full-graph snapshot to
      // collaborators so they stay in sync. Skip when applying a remote change.
      if (!get().isApplyingRemote) broadcastGraphChange();
    },

    setIsApplyingRemote: (isApplyingRemote: boolean) => set({ isApplyingRemote }),
  })),
);

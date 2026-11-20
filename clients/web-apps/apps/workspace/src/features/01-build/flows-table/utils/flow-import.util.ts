import { FlowTypesEnum } from "@avplatform/ui/enums/flow-types-enum";
import { deepParse, maxLenError, reqError } from "@avplatform/ui/utils";
import type { Edge, Node } from "@xyflow/react";

import { flowNameSchema } from "../constants/flow-zod-schema";
import type {
  FlowImportCanvas,
  FlowImportPayload,
  FlowImportVariable,
} from "../types/flow-import.type";

const REQUIRED_CANVAS_KEYS = ["nodes", "edges", "viewport"];

const KNOWN_AGENT_TYPES = new Set<string>(Object.values(FlowTypesEnum));

const SUPPORTED_PLATFORMS = new Set(["cloud", "windows"]);

const INVALID_FILE_MESSAGE = "Please upload valid data";

/** Unique node name identifying the Chat AI action, mirroring the Studio's graph check. */
const CHAT_AGENT_NODE_NAME = "CreateConversationAIAgent";

/** Unique node name identifying the Voice AI action, mirroring the Studio's graph check. */
const VOICE_AGENT_NODE_NAME = "CreateVoiceAIAgent";

/** Structural node types that never appear in a Chat or Voice agent graph. */
const SINGLE_NODE_GRAPH_FORBIDDEN_TYPES = new Set([
  "triggerNode",
  "plusNode",
  "plusFirstNode",
  "mergeBranchesNode",
  "branchStartNode",
  "branchNode1",
  "branchEndNode",
  "flowEndNode",
]);

type ImportGraphNode = {
  id: string;
  type?: string;
  data?: Record<string, unknown>;
};

type ImportGraphEdge = {
  id: string;
  source: string;
  target: string;
};

type ImportGraphKind = "chat" | "voice" | "generic";

type ImportFileContent = {
  agent?: unknown;
  reactFlowObject?: unknown;
  flowVariablesObject?: unknown;
};

const isObject = (value: unknown): value is Record<string, unknown> =>
  !!value && typeof value === "object" && !Array.isArray(value);

const isGraphNode = (value: unknown): value is ImportGraphNode =>
  isObject(value) && typeof value.id === "string";

const isGraphEdge = (value: unknown): value is ImportGraphEdge =>
  isObject(value) &&
  typeof value.id === "string" &&
  typeof value.source === "string" &&
  typeof value.target === "string";

const isSingleNodeAgentGraph = (
  nodes: ImportGraphNode[],
  edges: ImportGraphEdge[],
  aiNodeName: string,
): boolean => {
  const aiNodes = nodes.filter((node) => node.type === "aiNode" && node.data?.name === aiNodeName);
  if (aiNodes.length !== 1) return false;
  if (nodes.some((node) => SINGLE_NODE_GRAPH_FORBIDDEN_TYPES.has(node.type ?? ""))) return false;
  if (nodes.some((node) => node.type !== "aiNode" && node.type !== "modelNode")) return false;
  const nodeIds = new Set(nodes.map((node) => node.id));
  return !edges.some((edge) => !nodeIds.has(edge.source) || !nodeIds.has(edge.target));
};

// IMPORTANT NOTE: the predicates below mirror the Studio's chat/voice-agent-graph utils,
// which the workspace app cannot import; keep the node names and forbidden types in sync.
const getImportGraphKind = (nodes: ImportGraphNode[], edges: ImportGraphEdge[]): ImportGraphKind =>
  isSingleNodeAgentGraph(nodes, edges, CHAT_AGENT_NODE_NAME)
    ? "chat"
    : isSingleNodeAgentGraph(nodes, edges, VOICE_AGENT_NODE_NAME)
      ? "voice"
      : "generic";

/** Entry check mirroring the exporter's filter; a variable names its node and string outputs. */
const isFlowImportVariable = (value: unknown): value is FlowImportVariable =>
  isObject(value) &&
  typeof (value as FlowImportVariable).nodeId === "string" &&
  Array.isArray((value as FlowImportVariable).outputs) &&
  (value as FlowImportVariable).outputs.every((output) => typeof output === "string");

/**
 * Rejects graphs the canvas cannot open or run: missing edge endpoints and conditional/loop
 * nodes with missing merge ids or no branches. Empty canvases stay valid.
 */
export const validateImportedFlowGraph = (
  nodes: ImportGraphNode[],
  edges: ImportGraphEdge[],
): string | null => {
  if (nodes.length === 0) return null;

  const nodeIdSet = new Set(nodes.map((node) => node.id.toLowerCase()));

  for (const edge of edges) {
    if (!edge.source.trim() || !edge.target.trim()) {
      return "Flow contains edge(s) with missing source or target.";
    }
    if (!nodeIdSet.has(edge.source.toLowerCase()) || !nodeIdSet.has(edge.target.toLowerCase())) {
      return `Flow contains dangling edge: '${edge.source}' -> '${edge.target}'.`;
    }
  }

  const conditionalNodes = nodes.filter(
    (node) => (node.type ?? "").toLowerCase() === "conditionalnode",
  );
  for (const conditionalNode of conditionalNodes) {
    const data = conditionalNode.data ?? {};
    const mergeNodeId = data.mergeBranchesNodeId;
    if (typeof mergeNodeId !== "string" || !mergeNodeId.trim()) {
      return `Conditional node '${conditionalNode.id}' is missing merge node id.`;
    }
    if (!nodeIdSet.has(mergeNodeId.toLowerCase())) {
      return `Conditional node '${conditionalNode.id}' has invalid merge node id '${mergeNodeId}'.`;
    }
    const configuredBranches = Array.isArray(data.branches)
      ? (data.branches as unknown[]).filter(
          (branch): branch is string =>
            typeof branch === "string" &&
            !!branch.trim() &&
            branch.toLowerCase() !== mergeNodeId.toLowerCase(),
        )
      : [];
    const branches =
      configuredBranches.length > 0
        ? [...new Set(configuredBranches)]
        : [
            ...new Set(
              edges
                .filter(
                  (edge) =>
                    edge.source === conditionalNode.id &&
                    edge.target.toLowerCase() !== mergeNodeId.toLowerCase(),
                )
                .map((edge) => edge.target)
                .filter((target) => !!target.trim()),
            ),
          ];
    if (branches.length === 0) {
      return `Conditional node '${conditionalNode.id}' has no branch entry nodes.`;
    }
  }

  const loopNodes = nodes.filter((node) => (node.type ?? "").toLowerCase() === "forloopnode");
  for (const loopNode of loopNodes) {
    const data = loopNode.data ?? {};
    const mergeNodeId = data.mergeBranchesNodeId;
    if (typeof mergeNodeId !== "string" || !mergeNodeId.trim()) {
      return `For loop node '${loopNode.id}' is missing merge node id.`;
    }
    if (!nodeIdSet.has(mergeNodeId.toLowerCase())) {
      return `For loop node '${loopNode.id}' has invalid merge node id '${mergeNodeId}'.`;
    }
    const hasBodyEdge = edges.some(
      (edge) =>
        edge.source === loopNode.id && edge.target.toLowerCase() !== mergeNodeId.toLowerCase(),
    );
    if (!hasBodyEdge) {
      return `For loop node '${loopNode.id}' has no loop body entry edge.`;
    }
  }

  return null;
};

const readCanvasGraph = (canvas: Record<string, unknown>): { nodes: Node[]; edges: Edge[] } => {
  const nodes = canvas.nodes;
  const edges = canvas.edges;
  const hasGraphLists = Array.isArray(nodes) && Array.isArray(edges);
  if (!hasGraphLists || !nodes.every(isGraphNode) || !edges.every(isGraphEdge)) {
    throw new Error(INVALID_FILE_MESSAGE);
  }

  const nodeIds = new Set(nodes.map((node) => node.id));
  if (edges.some((edge) => !nodeIds.has(edge.source) || !nodeIds.has(edge.target))) {
    throw new Error(INVALID_FILE_MESSAGE);
  }

  return { nodes: nodes as Node[], edges: edges as Edge[] };
};

const readAgentMetadata = (agent: Record<string, unknown>) => {
  const { name, type, description } = agent;

  if (typeof name !== "string") throw new Error(reqError("Agent name"));
  const nameCheck = flowNameSchema.safeParse(name);
  if (!nameCheck.success) throw new Error(nameCheck.error.errors[0].message);

  if (typeof type !== "string" || !KNOWN_AGENT_TYPES.has(type)) {
    throw new Error("Unknown agent type");
  }

  if (description !== undefined && typeof description !== "string") {
    throw new Error("Agent description must be text");
  }
  if ((description ?? "").length > 500) {
    throw new Error(maxLenError("Agent description", 500));
  }

  return {
    name,
    type: type as FlowTypesEnum,
    description: (description as string | undefined) ?? "",
  };
};

const readSupportedPlatform = (value: unknown): string | undefined => {
  if (value === undefined || value === null) return undefined;
  if (typeof value !== "string" || !SUPPORTED_PLATFORMS.has(value)) {
    throw new Error("Unknown supported platform");
  }
  return value;
};

/**
 * Validates an exported agent JSON file and derives everything needed to create the agent.
 */
export const parseFlowImportContent = (content: string, fileName: string): FlowImportPayload => {
  const parsed = deepParse(content);
  if (!isObject(parsed)) throw new Error("Error parsing file content");

  const file = parsed as ImportFileContent;
  const canvas = file.reactFlowObject;
  const hasCanvas =
    isObject(canvas) && REQUIRED_CANVAS_KEYS.every((key) => Object.hasOwn(canvas, key));
  if (!hasCanvas) throw new Error(INVALID_FILE_MESSAGE);

  const canvasRecord = canvas as Record<string, unknown>;
  const flowVariablesObject = Object.hasOwn(canvasRecord, "flowVariablesObject")
    ? canvasRecord.flowVariablesObject
    : file.flowVariablesObject;
  if (flowVariablesObject !== undefined && !Array.isArray(flowVariablesObject)) {
    throw new Error("Invalid flow variables object (must be an array)");
  }
  if (Array.isArray(flowVariablesObject) && !flowVariablesObject.every(isFlowImportVariable)) {
    throw new Error("Invalid flow variables object (entries must have a nodeId and outputs)");
  }

  const inputOutputObject = canvasRecord.inputOutputObject;
  if (inputOutputObject !== undefined && !Array.isArray(inputOutputObject)) {
    throw new Error("Invalid input/output object (must be an array)");
  }

  const { nodes, edges } = readCanvasGraph(canvasRecord);
  const graphError = validateImportedFlowGraph(
    nodes as ImportGraphNode[],
    edges as ImportGraphEdge[],
  );
  if (graphError) throw new Error(graphError);
  const platformValue = canvasRecord.supportedPlatform;
  const canvasRest = { ...canvasRecord };
  delete canvasRest.flowVariablesObject;
  delete canvasRest.inputOutputObject;
  delete canvasRest.supportedPlatform;
  const canvasPayload = { ...canvasRest, nodes, edges } as FlowImportCanvas;

  if (!Object.hasOwn(file, "agent")) {
    const derivedName = fileName.replace(/\.json$/i, "");
    const derivedNameCheck = flowNameSchema.safeParse(derivedName);
    if (!derivedNameCheck.success) throw new Error(derivedNameCheck.error.errors[0].message);
    const graphKind = getImportGraphKind(nodes as ImportGraphNode[], edges as ImportGraphEdge[]);
    return {
      name: derivedName,
      type:
        graphKind === "chat"
          ? FlowTypesEnum.ChatAgent
          : graphKind === "voice"
            ? FlowTypesEnum.VoiceAgent
            : FlowTypesEnum.Agent,
      description: "",
      canvas: canvasPayload,
      flowVariablesObject: (flowVariablesObject as FlowImportVariable[] | undefined) ?? [],
      ...(inputOutputObject ? { inputOutputObject: inputOutputObject as unknown[] } : {}),
    };
  }

  if (!isObject(file.agent)) throw new Error(INVALID_FILE_MESSAGE);

  const supportedPlatform = readSupportedPlatform(platformValue);

  return {
    ...readAgentMetadata(file.agent),
    canvas: canvasPayload,
    flowVariablesObject: (flowVariablesObject as FlowImportVariable[] | undefined) ?? [],
    ...(inputOutputObject ? { inputOutputObject: inputOutputObject as unknown[] } : {}),
    ...(supportedPlatform ? { supportedPlatform } : {}),
  };
};

/**
 * Reads an exported agent JSON file and validates it for direct creation.
 */
export const readFlowImportFile = (file: File): Promise<FlowImportPayload> =>
  new Promise((resolve, reject) => {
    const isJson = file.type === "application/json" || file.name.toLowerCase().endsWith(".json");
    if (!isJson) {
      reject(new Error("Unsupported file type"));
      return;
    }

    const reader = new FileReader();
    reader.onerror = () => reject(new Error("Error reading the file"));
    reader.onload = (event) => {
      try {
        resolve(parseFlowImportContent(String(event.target?.result ?? ""), file.name));
      } catch (error) {
        reject(error instanceof Error ? error : new Error("Error parsing file content"));
      }
    };
    reader.readAsText(file);
  });

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

  const inputOutputObject = canvasRecord.inputOutputObject;
  if (inputOutputObject !== undefined && !Array.isArray(inputOutputObject)) {
    throw new Error("Invalid input/output object (must be an array)");
  }

  const { nodes, edges } = readCanvasGraph(canvasRecord);
  const platformValue = canvasRecord.supportedPlatform;
  const canvasRest = { ...canvasRecord };
  delete canvasRest.flowVariablesObject;
  delete canvasRest.inputOutputObject;
  delete canvasRest.supportedPlatform;
  const canvasPayload = { ...canvasRest, nodes, edges } as FlowImportCanvas;

  if (!Object.hasOwn(file, "agent")) {
    const graphKind = getImportGraphKind(nodes as ImportGraphNode[], edges as ImportGraphEdge[]);
    return {
      name: fileName.replace(/\.json$/i, ""),
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

import { Edge, Node, Position } from "@xyflow/react";

import { FlowVariablesObjectType } from "@/types/flow-variables-object-type";
import { NodeDataType, NodeInputType, NodeOutputType } from "@/types/node-data-type";
import { createDottedEdgeObj } from "@/utils/create-edges/create-dotted-edge-obj";
import { createNodeObj } from "@/utils/create-nodes/create-node-obj";
import { createSupportNodeObj } from "@/utils/create-nodes/create-support-node-obj";

/** Unique node name used to identify the Voice AI action. */
export const VOICE_AGENT_NODE_NAME = "CreateVoiceAIAgent";

/** Default first-speaker value; the Voice AI waits for the caller. */
export const VOICE_AGENT_DEFAULT_FIRST_SPEAKER = "human";

/** React Flow graph plus variables associated with a VoiceAgent. */
type VoiceAgentGraph = {
  /** Voice AI and model support nodes. */
  nodes: Node[];
  /** The model support edge; VoiceAgents have no main-flow edges. */
  edges: Edge[];
  /** Output variables exposed by the Voice AI node. */
  flowVariablesObject: FlowVariablesObjectType[];
};

/** Creates the default configuration for a Voice AI node. */
const createDefaultVoiceAgentData = (): NodeDataType => ({
  type: "aiNode",
  name: VOICE_AGENT_NODE_NAME,
  label: "Voice AI",
  description:
    "Handles voice conversations with human-like turn taking, an optional introduction, and agent-level persona.",
  icon: "",
  img: "/assets/ConversationModel.svg",
  supportedPlatforms: ["cloud", "windows"],
  inputs: [
    { key: "__FirstSpeaker__Voice", value: VOICE_AGENT_DEFAULT_FIRST_SPEAKER },
    { key: "__Introduction__Voice", value: "" },
    { key: "__Goal__Voice", value: "" },
    { key: "__Role__Voice", value: "" },
    { key: "__Instructions__Voice", value: "" },
    { key: "__ManagerAgent__Voice", value: "" },
    {
      key: "__ModelConfig__Voice",
      value: {
        is_byok_enabled: true,
        provider: "",
        credential_name: "",
        model: "",
        temperature: 1,
        top_p: 1,
        max_output_tokens: null,
        reasoning_effort: "medium",
      },
    },
    {
      key: "__ModelConfig__SpeechToText",
      value: {
        is_byok_enabled: true,
        provider: "",
        credential_name: "",
        model: "",
        temperature: 1,
        top_p: 1,
        max_output_tokens: null,
      },
    },
    {
      key: "__ModelConfig__TextToSpeech",
      value: {
        is_byok_enabled: true,
        provider: "",
        credential_name: "",
        model: "",
        temperature: 1,
        top_p: 1,
        max_output_tokens: null,
      },
    },
    {
      key: "__VoiceConfig__TextToSpeech",
      value: {
        language: "en",
        voice: "",
        speed: 1,
      },
    },
    { key: "__EngineMode__Voice", value: "pipeline" },
    {
      key: "__ModelConfig__RealtimeVoice",
      value: {
        is_byok_enabled: true,
        provider: "",
        credential_name: "",
        model: "",
        temperature: 1,
        top_p: 1,
        max_output_tokens: null,
        reasoning_effort: "medium",
      },
    },
    { key: "__CallRecording__Voice", value: false },
    { key: "__PreemptiveGeneration__Voice", value: false },
    { key: "__NoiseCancellation__Voice", value: "none" },
    {
      key: "__KbConfig__Voice",
      value: {
        knowledgeBase: [],
        sourceThreshold: 0.1,
        numberOfChunks: 5,
      },
    },
    { key: "__SkillsConfig__Voice", value: { skills: [] } },
    {
      key: "__MemoryConfig__Voice",
      value: {
        memoryProvider: "Memory Provider 1",
        maxDataStored: 20,
      },
    },
    { key: "__ToolsConfig__Voice", value: [] },
  ],
  outputs: [
    {
      key: "Result",
      value: { value: "Result", enabled: true },
    },
  ],
});

/** Merges saved node values with any newly introduced default fields. */
const mergeNodeValues = <T extends { key: string }>(defaults: T[], existing?: T[]): T[] => {
  /** Existing values take precedence over defaults for matching keys. */
  const existingByKey = new Map((existing ?? []).map((value) => [value.key, value]));
  /** Keys supplied by the default configuration. */
  const defaultKeys = new Set(defaults.map((value) => value.key));

  return [
    ...defaults.map((value) => existingByKey.get(value.key) ?? value),
    ...(existing ?? []).filter((value) => !defaultKeys.has(value.key)),
  ];
};

/** Creates complete Voice AI data while preserving saved configuration values. */
const createVoiceAgentData = (existingData?: NodeDataType): NodeDataType => {
  /** Default fields ensure incomplete legacy nodes become executable. */
  const defaultData = createDefaultVoiceAgentData();

  return {
    ...defaultData,
    ...existingData,
    type: "aiNode",
    name: VOICE_AGENT_NODE_NAME,
    inputs: mergeNodeValues<NodeInputType>(defaultData.inputs ?? [], existingData?.inputs),
    outputs: mergeNodeValues<NodeOutputType>(defaultData.outputs ?? [], existingData?.outputs),
  };
};

/** Creates or normalizes the non-deletable Voice AI node. */
const createVoiceAgentNode = (existingNode?: Node): Node => {
  /** Existing node data is preserved when normalizing a saved graph. */
  const existingData = existingNode?.data as NodeDataType | undefined;
  /** Reuse the existing node identity or create a new Voice AI node. */
  const node = existingNode
    ? {
        ...existingNode,
        data: createVoiceAgentData(existingData),
      }
    : createNodeObj(createVoiceAgentData());

  return {
    ...node,
    type: "aiNode",
    dragHandle: ".custom-drag-handle",
    deletable: false,
    draggable: true,
    selectable: true,
    targetPosition: Position.Left,
    sourcePosition: Position.Right,
  };
};

/** Creates or normalizes the model support node attached to Voice AI. */
const createVoiceModelNode = (voiceNodeId: string, existingNode?: Node): Node => {
  /** Reuse a saved model node when possible to preserve its position and state. */
  const node = existingNode ?? createSupportNodeObj("modelNode", voiceNodeId);

  return {
    ...node,
    type: "modelNode",
    parentId: voiceNodeId,
    deletable: false,
    draggable: true,
    selectable: false,
    hidden: node.hidden ?? false,
    data: node.data ?? { label: "" },
  };
};

/** Creates or normalizes the non-deletable dotted model edge. */
const createVoiceModelEdge = (
  voiceNodeId: string,
  modelNodeId: string,
  existingEdge?: Edge,
): Edge => {
  /** Reuse the saved edge identity when normalizing an existing graph. */
  const edge = existingEdge
    ? { ...existingEdge }
    : createDottedEdgeObj(modelNodeId, voiceNodeId, undefined, "model-node");

  delete edge.label;
  delete edge.markerEnd;

  return {
    ...edge,
    source: modelNodeId,
    target: voiceNodeId,
    deletable: false,
    selectable: false,
    style: { strokeDasharray: "5,5", strokeWidth: 1 },
    targetHandle: "model-node",
  };
};

/** Node types that are never allowed in a VoiceAgent graph besides the Voice AI node. */
const FORBIDDEN_VOICE_AGENT_NODE_TYPES = new Set([
  "triggerNode",
  "plusNode",
  "plusFirstNode",
  "mergeBranchesNode",
  "branchStartNode",
  "branchNode1",
  "branchEndNode",
  "flowEndNode",
]);

/**
 * Validates that a graph satisfies the VoiceAgent single-node shape.
 * Returns an error message when invalid, otherwise null.
 */
export const validateVoiceAgentGraph = (nodes: Node[], edges: Edge[]): string | null => {
  /** The Voice AI node is the only executable node allowed in a VoiceAgent. */
  const voiceNodes = nodes.filter(
    (node) => node.type === "aiNode" && node.data?.name === VOICE_AGENT_NODE_NAME,
  );

  if (voiceNodes.length === 0) return "Voice agent must contain a Voice AI node.";
  if (voiceNodes.length > 1) return "Voice agent must contain exactly one Voice AI node.";

  /** Structural nodes from the generic agent shape must never be published in a VoiceAgent. */
  const forbidden = nodes.find((node) => FORBIDDEN_VOICE_AGENT_NODE_TYPES.has(node.type ?? ""));
  if (forbidden) return `Voice agent cannot contain ${forbidden.type} nodes.`;

  /** Any other executable node type is rejected; only the model support node may remain. */
  const unexpected = nodes.find((node) => node.type !== "aiNode" && node.type !== "modelNode");
  if (unexpected) return `Voice agent cannot contain ${unexpected.type} nodes.`;

  /** Edges must reference surviving nodes so no dangling edge can be published. */
  const nodeIds = new Set(nodes.map((node) => node.id));
  const dangling = edges.find((edge) => !nodeIds.has(edge.source) || !nodeIds.has(edge.target));
  if (dangling) return "Voice agent contains an edge with a missing source or target.";

  return null;
};

/**
 * Returns true when a graph matches the VoiceAgent single-node shape.
 * The shape (the absence of structural nodes) is the reliable discriminator
 * between a VoiceAgent and a generic agent that also contains the Voice AI action.
 */
export const isVoiceAgentGraph = (nodes: Node[], edges: Edge[]): boolean =>
  validateVoiceAgentGraph(nodes, edges) === null;

/** Builds flow variables from the enabled Voice AI outputs. */
const getVoiceFlowVariables = (voiceNode: Node): FlowVariablesObjectType[] => {
  /** Only enabled Voice AI outputs should be exposed as flow variables. */
  const outputs = ((voiceNode.data as NodeDataType | undefined)?.outputs ?? [])
    .filter((output) => output.value.enabled)
    .map((output) => output.key);

  return [
    {
      nodeId: voiceNode.id,
      outputs: outputs.length > 0 ? outputs : ["Result"],
    },
  ];
};

/** Creates the default graph used when a VoiceAgent graph is missing. */
export const createVoiceAgentGraph = (): VoiceAgentGraph => {
  /** Create the single executable node allowed in a VoiceAgent. */
  const voiceNode = createVoiceAgentNode();
  /** Create the non-executable model support node. */
  const modelNode = createVoiceModelNode(voiceNode.id);
  /** Connect the model support node to the Voice AI model handle. */
  const modelEdge = createVoiceModelEdge(voiceNode.id, modelNode.id);

  return {
    nodes: [voiceNode, modelNode],
    edges: [modelEdge],
    flowVariablesObject: getVoiceFlowVariables(voiceNode),
  };
};

/**
 * Restricts a graph to the VoiceAgent shape while preserving the Voice AI configuration.
 * The model node is a non-executable support node and is retained for its model handle.
 */
export const normalizeVoiceAgentGraph = (nodes: Node[], edges: Edge[]): VoiceAgentGraph => {
  /** Keep the first valid Voice AI node and discard other executable nodes. */
  const existingVoiceNode = nodes.find(
    (node) => node.type === "aiNode" && node.data?.name === VOICE_AGENT_NODE_NAME,
  );
  /** Ensure the Voice AI node has complete defaults and cannot be deleted. */
  const voiceNode = createVoiceAgentNode(existingVoiceNode);
  /** Reuse the first compatible model support node, if present. */
  const existingModelNode = nodes.find(
    (node) => node.type === "modelNode" && (!node.parentId || node.parentId === voiceNode.id),
  );
  /** Ensure the support node remains attached to the normalized Voice AI node. */
  const modelNode = createVoiceModelNode(voiceNode.id, existingModelNode);
  /** Preserve an existing model edge identity where available. */
  const existingModelEdge = edges.find(
    (edge) => edge.source === modelNode.id && edge.target === voiceNode.id,
  );
  /** Remove main-flow/plus metadata from the model support edge. */
  const modelEdge = createVoiceModelEdge(voiceNode.id, modelNode.id, existingModelEdge);

  return {
    nodes: [voiceNode, modelNode],
    edges: [modelEdge],
    flowVariablesObject: getVoiceFlowVariables(voiceNode),
  };
};

/**
 * Reads the Voice AI node's human/AI-first behaviour from a graph.
 * Missing or unknown values fall back to human-first so callers never
 * open a conversation with an AI message by accident.
 */
export const getVoiceAgentFirstSpeaker = (nodes: Node[]): string => {
  const voiceNode = nodes.find(
    (node) => node.type === "aiNode" && node.data?.name === VOICE_AGENT_NODE_NAME,
  );
  const inputs = ((voiceNode?.data as NodeDataType | undefined)?.inputs ?? []) as NodeInputType[];
  const value = inputs.find((input) => input.key === "__FirstSpeaker__Voice")?.value;

  return value === "ai" ? "ai" : VOICE_AGENT_DEFAULT_FIRST_SPEAKER;
};

/** Reads the Voice AI node's configured introduction from a graph. */
export const getVoiceAgentIntroduction = (nodes: Node[]): string => {
  const voiceNode = nodes.find(
    (node) => node.type === "aiNode" && node.data?.name === VOICE_AGENT_NODE_NAME,
  );
  const inputs = ((voiceNode?.data as NodeDataType | undefined)?.inputs ?? []) as NodeInputType[];
  const value = inputs.find((input) => input.key === "__Introduction__Voice")?.value;

  return typeof value === "string" ? value : "";
};

/**
 * Returns the introduction the caller should see at the start of a VoiceAgent
 * conversation, or an empty string when the AI must wait for the caller.
 */
export const getVoiceAgentOpeningMessage = (nodes: Node[]): string => {
  if (getVoiceAgentFirstSpeaker(nodes) !== "ai") return "";

  return getVoiceAgentIntroduction(nodes).trim();
};

/**
 * Validates the VoiceAgent conversation behaviour before publishing.
 * Returns an error message when invalid, otherwise null.
 */
export const validateVoiceAgentConversation = (nodes: Node[]): string | null => {
  if (getVoiceAgentFirstSpeaker(nodes) !== "ai") return null;
  if (getVoiceAgentIntroduction(nodes).trim().length > 0) return null;

  return "Voice agent introduction is required when the AI speaks first.";
};

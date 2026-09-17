import { Edge, Node, Position } from "@xyflow/react";

import { FlowVariablesObjectType } from "@/types/flow-variables-object-type";
import { NodeDataType, NodeInputType, NodeOutputType } from "@/types/node-data-type";
import { createDottedEdgeObj } from "@/utils/create-edges/create-dotted-edge-obj";
import { createNodeObj } from "@/utils/create-nodes/create-node-obj";
import { createSupportNodeObj } from "@/utils/create-nodes/create-support-node-obj";

/** Unique node name used to identify the Chat AI action. */
export const CHAT_AGENT_NODE_NAME = "CreateConversationAIAgent";

/** React Flow graph plus variables associated with a ChatAgent. */
type ChatAgentGraph = {
  /** Chat AI and model support nodes. */
  nodes: Node[];
  /** The model support edge; ChatAgents have no main-flow edges. */
  edges: Edge[];
  /** Output variables exposed by the Chat AI node. */
  flowVariablesObject: FlowVariablesObjectType[];
};

/** Default follow-up prompt used by the Chat AI recommended-actions config. */
const FOLLOW_UP_MESSAGE_PROMPT = [
  "You are a helpful AI assistant.",
  "",
  "Return only valid JSON that matches the provided schema.",
  "",
  "Rules:",
  '- Put the complete response in the "text" field.',
  '- Any question, clarification request, or information request for the user must appear only in the "text" field.',
  '- The "followup_messages" field is only for standalone actions the user can take without replying to the assistant.',
  '- Never include questions, follow-ups, or prompts in "followup_messages".',
  '- If the user must provide additional information to continue, "followup_messages" must be an empty array ([]).',
  "- Include at most 5 recommended actions.",
  "- Recommended actions should use clear, natural, user-facing language.",
  "- Do not include code, IDs, internal references, or technical jargon in recommended actions.",
  "- Return only JSON with no additional text or markdown.",
].join("\n");

/** Creates the default configuration for a Chat AI node. */
const createDefaultChatAgentData = (): NodeDataType => ({
  type: "aiNode",
  name: CHAT_AGENT_NODE_NAME,
  label: "Chat AI",
  description:
    "Manages multi-turn interactions with human-like understanding and memory to guide users through complex tasks.",
  icon: "",
  img: "/assets/ConversationModel.svg",
  supportedPlatforms: ["cloud", "windows"],
  inputs: [
    { key: "__Prompt__Conversation", value: "" },
    {
      key: "__ModelConfig__Conversation",
      value: {
        is_byok_enabled: false,
        provider: "openai",
        credential_name: "",
        model: "gpt-4o-mini",
        temperature: 1,
        top_p: 1,
        is_json_output: false,
        max_output_tokens: null,
      },
    },
    { key: "Files", value: "" },
    {
      key: "__KbConfig__Conversation",
      value: {
        knowledgeBase: [],
        retrievalType: "Basic",
        sourceThreshold: 0.1,
        numberOfChunks: 5,
      },
    },
    {
      key: "__SkillsConfig__Conversation",
      value: { skills: [] },
    },
    {
      key: "__MemoryConfig__Conversation",
      value: {
        memoryProvider: "Memory Provider 1",
        maxDataStored: 4,
      },
    },
    { key: "__ToolsConfig__Conversation", value: [] },
    {
      key: "__RecommendedActionsConfig__Conversation",
      value: {
        defaultActions: [],
        enableDynamicActions: false,
        followUpMessagePrompt: FOLLOW_UP_MESSAGE_PROMPT,
      },
    },
    { key: "__OnError__EnableAutoRetry", value: false },
    { key: "__OnError__FallbackBehavior", value: "abort" },
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

/** Creates complete Chat AI data while preserving saved configuration values. */
const createChatAgentData = (existingData?: NodeDataType): NodeDataType => {
  /** Default fields ensure incomplete legacy nodes become executable. */
  const defaultData = createDefaultChatAgentData();

  return {
    ...defaultData,
    ...existingData,
    type: "aiNode",
    name: CHAT_AGENT_NODE_NAME,
    inputs: mergeNodeValues<NodeInputType>(defaultData.inputs ?? [], existingData?.inputs),
    outputs: mergeNodeValues<NodeOutputType>(defaultData.outputs ?? [], existingData?.outputs),
  };
};

/** Creates or normalizes the non-deletable Chat AI node. */
const createChatAgentNode = (existingNode?: Node): Node => {
  /** Existing node data is preserved when normalizing a saved graph. */
  const existingData = existingNode?.data as NodeDataType | undefined;
  /** Reuse the existing node identity or create a new Chat AI node. */
  const node = existingNode
    ? {
        ...existingNode,
        data: createChatAgentData(existingData),
      }
    : createNodeObj(createChatAgentData());

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

/** Creates or normalizes the model support node attached to Chat AI. */
const createChatModelNode = (chatNodeId: string, existingNode?: Node): Node => {
  /** Reuse a saved model node when possible to preserve its position and state. */
  const node = existingNode ?? createSupportNodeObj("modelNode", chatNodeId);

  return {
    ...node,
    type: "modelNode",
    parentId: chatNodeId,
    deletable: false,
    draggable: true,
    selectable: false,
    hidden: node.hidden ?? false,
    data: node.data ?? { label: "openai" },
  };
};

/** Creates or normalizes the non-deletable dotted model edge. */
const createChatModelEdge = (
  chatNodeId: string,
  modelNodeId: string,
  existingEdge?: Edge,
): Edge => {
  /** Reuse the saved edge identity when normalizing an existing graph. */
  const edge = existingEdge
    ? { ...existingEdge }
    : createDottedEdgeObj(modelNodeId, chatNodeId, undefined, "model-node");

  delete edge.label;
  delete edge.markerEnd;

  return {
    ...edge,
    source: modelNodeId,
    target: chatNodeId,
    deletable: false,
    selectable: false,
    style: { strokeDasharray: "5,5", strokeWidth: 1 },
    targetHandle: "model-node",
  };
};

/** Node types that are never allowed in a ChatAgent graph besides the Chat AI node. */
const FORBIDDEN_CHAT_AGENT_NODE_TYPES = new Set([
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
 * Validates that a graph satisfies the ChatAgent single-node shape.
 * Returns an error message when invalid, otherwise null.
 */
export const validateChatAgentGraph = (nodes: Node[], edges: Edge[]): string | null => {
  /** The Chat AI node is the only executable node allowed in a ChatAgent. */
  const chatNodes = nodes.filter(
    (node) => node.type === "aiNode" && node.data?.name === CHAT_AGENT_NODE_NAME,
  );

  if (chatNodes.length === 0) return "Chat agent must contain a Chat AI node.";
  if (chatNodes.length > 1) return "Chat agent must contain exactly one Chat AI node.";

  /** Structural nodes from the generic agent shape must never be published in a ChatAgent. */
  const forbidden = nodes.find((node) => FORBIDDEN_CHAT_AGENT_NODE_TYPES.has(node.type ?? ""));
  if (forbidden) return `Chat agent cannot contain ${forbidden.type} nodes.`;

  /** Any other executable node type is rejected; only the model support node may remain. */
  const unexpected = nodes.find((node) => node.type !== "aiNode" && node.type !== "modelNode");
  if (unexpected) return `Chat agent cannot contain ${unexpected.type} nodes.`;

  /** Edges must reference surviving nodes so no dangling edge can be published. */
  const nodeIds = new Set(nodes.map((node) => node.id));
  const dangling = edges.find((edge) => !nodeIds.has(edge.source) || !nodeIds.has(edge.target));
  if (dangling) return "Chat agent contains an edge with a missing source or target.";

  return null;
};

/**
 * Returns true when a graph matches the ChatAgent single-node shape.
 * A generic agent may also contain the Chat AI action, so the shape (the absence
 * of structural nodes) is the reliable discriminator between the two flow types.
 */
export const isChatAgentGraph = (nodes: Node[], edges: Edge[]): boolean =>
  validateChatAgentGraph(nodes, edges) === null;

/** Builds flow variables from the enabled Chat AI outputs. */
const getChatFlowVariables = (chatNode: Node): FlowVariablesObjectType[] => {
  /** Only enabled Chat AI outputs should be exposed as flow variables. */
  const outputs = ((chatNode.data as NodeDataType | undefined)?.outputs ?? [])
    .filter((output) => output.value.enabled)
    .map((output) => output.key);

  return [
    {
      nodeId: chatNode.id,
      outputs: outputs.length > 0 ? outputs : ["Result"],
    },
  ];
};

/** Creates the default graph used when a ChatAgent graph is missing. */
export const createChatAgentGraph = (): ChatAgentGraph => {
  /** Create the single executable node allowed in a ChatAgent. */
  const chatNode = createChatAgentNode();
  /** Create the non-executable model support node. */
  const modelNode = createChatModelNode(chatNode.id);
  /** Connect the model support node to the Chat AI model handle. */
  const modelEdge = createChatModelEdge(chatNode.id, modelNode.id);

  return {
    nodes: [chatNode, modelNode],
    edges: [modelEdge],
    flowVariablesObject: getChatFlowVariables(chatNode),
  };
};

/**
 * Restricts a graph to the ChatAgent shape while preserving the Chat AI configuration.
 * The model node is a non-executable support node and is retained for its model handle.
 */
export const normalizeChatAgentGraph = (nodes: Node[], edges: Edge[]): ChatAgentGraph => {
  /** Keep the first valid Chat AI node and discard other executable nodes. */
  const existingChatNode = nodes.find(
    (node) => node.type === "aiNode" && node.data?.name === CHAT_AGENT_NODE_NAME,
  );
  /** Ensure the Chat AI node has complete defaults and cannot be deleted. */
  const chatNode = createChatAgentNode(existingChatNode);
  /** Reuse the first compatible model support node, if present. */
  const existingModelNode = nodes.find(
    (node) => node.type === "modelNode" && (!node.parentId || node.parentId === chatNode.id),
  );
  /** Ensure the support node remains attached to the normalized Chat AI node. */
  const modelNode = createChatModelNode(chatNode.id, existingModelNode);
  /** Preserve an existing model edge identity where available. */
  const existingModelEdge = edges.find(
    (edge) => edge.source === modelNode.id && edge.target === chatNode.id,
  );
  /** Remove main-flow/plus metadata from the model support edge. */
  const modelEdge = createChatModelEdge(chatNode.id, modelNode.id, existingModelEdge);

  return {
    nodes: [chatNode, modelNode],
    edges: [modelEdge],
    flowVariablesObject: getChatFlowVariables(chatNode),
  };
};

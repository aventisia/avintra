import { FlowTypesEnum } from "@avplatform/ui/enums/flow-types-enum";
import { FlowVariablesEntry, applyFlowInputsToVariables, deepParse } from "@avplatform/ui/utils";

import { LoadFlowDto } from "@/features/01-build/flow-builder";

const parseJsonArray = (json?: string | null): unknown[] => {
  const parsed: unknown = deepParse(json || "[]");
  return Array.isArray(parsed) ? parsed : [];
};

const parseJsonObject = (json?: string | null): Record<string, unknown> => {
  const parsed: unknown = deepParse(json || "{}");
  return parsed && typeof parsed === "object" && !Array.isArray(parsed)
    ? (parsed as Record<string, unknown>)
    : {};
};

const isFlowVariablesEntry = (entry: unknown): entry is FlowVariablesEntry =>
  !!entry &&
  typeof entry === "object" &&
  typeof (entry as FlowVariablesEntry).nodeId === "string" &&
  Array.isArray((entry as FlowVariablesEntry).outputs) &&
  (entry as FlowVariablesEntry).outputs.every((o) => typeof o === "string");

const toFlowVariablesEntries = (value: unknown[]): FlowVariablesEntry[] =>
  value.filter(isFlowVariablesEntry);

/** Unique node name identifying the Chat AI action, mirroring the Studio's Export derivation. */
const CHAT_AI_NODE_NAME = "CreateConversationAIAgent";

/** Input key holding the Chat recommended-actions config on the Chat AI node. */
const CHAT_RECOMMENDED_ACTIONS_INPUT_KEY = "__RecommendedActionsConfig__Conversation";

/** Unique node name identifying the Voice AI action, mirroring the Studio's Export derivation. */
const VOICE_AI_NODE_NAME = "CreateVoiceAIAgent";

/** Input keys holding the Voice conversation behaviour on the Voice AI node. */
const VOICE_FIRST_SPEAKER_INPUT_KEY = "__FirstSpeaker__Voice";
const VOICE_INTRODUCTION_INPUT_KEY = "__Introduction__Voice";

type ExportCanvasInput = {
  key?: unknown;
  value?: unknown;
};

type ExportCanvasNode = {
  data?: {
    name?: unknown;
    inputs?: ExportCanvasInput[];
  };
};

const readNodeInputs = (nodes: unknown[], nodeName: string): ExportCanvasInput[] => {
  const inputs = (nodes as ExportCanvasNode[]).find((node) => node?.data?.name === nodeName)?.data
    ?.inputs;
  return Array.isArray(inputs) ? inputs : [];
};

const readInputValue = (inputs: ExportCanvasInput[], key: string): unknown =>
  inputs.find((input) => input?.key === key)?.value;

// IMPORTANT NOTE: the derivations below mirror the Studio Export; both writers must keep the
// same canvas keys so a round-trip through Import changes nothing.
const getChatDefaultActions = (nodes: unknown[]): string[] => {
  const value = readInputValue(
    readNodeInputs(nodes, CHAT_AI_NODE_NAME),
    CHAT_RECOMMENDED_ACTIONS_INPUT_KEY,
  ) as { defaultActions?: unknown } | undefined;
  return Array.isArray(value?.defaultActions) &&
    (value.defaultActions as unknown[]).every((action) => typeof action === "string")
    ? (value.defaultActions as string[])
    : [];
};

const getVoiceFirstSpeaker = (nodes: unknown[]): string =>
  readInputValue(readNodeInputs(nodes, VOICE_AI_NODE_NAME), VOICE_FIRST_SPEAKER_INPUT_KEY) === "ai"
    ? "ai"
    : "human";

const getVoiceIntroduction = (nodes: unknown[]): string => {
  const value = readInputValue(
    readNodeInputs(nodes, VOICE_AI_NODE_NAME),
    VOICE_INTRODUCTION_INPUT_KEY,
  );
  return typeof value === "string" ? value : "";
};

/**
 * Builds the exported file: the agent's create metadata plus the canvas with flow variables,
 * inputs/outputs and platform nested in `reactFlowObject`.
 */
export const buildFlowExportPayload = (loadFlow: LoadFlowDto) => {
  const inputOutputObject = parseJsonArray(loadFlow.inputOutputObject);
  const flowVariablesObject = applyFlowInputsToVariables(
    toFlowVariablesEntries(parseJsonArray(loadFlow.flowVariablesObject)),
    inputOutputObject,
  );
  const canvasObject = parseJsonObject(loadFlow.reactFlowObject);
  const canvasNodes = Array.isArray(canvasObject.nodes) ? canvasObject.nodes : [];

  return {
    agent: {
      name: loadFlow.name,
      type: loadFlow.type,
      description: loadFlow.description ?? "",
    },
    reactFlowObject: {
      ...canvasObject,
      flowVariablesObject,
      inputOutputObject,
      ...(loadFlow.supportedPlatform ? { supportedPlatform: loadFlow.supportedPlatform } : {}),
      ...(loadFlow.type === FlowTypesEnum.ChatAgent && {
        defaultActions: getChatDefaultActions(canvasNodes),
      }),
      ...(loadFlow.type === FlowTypesEnum.VoiceAgent && {
        firstSpeaker: getVoiceFirstSpeaker(canvasNodes),
        voiceIntroduction: getVoiceIntroduction(canvasNodes),
      }),
    },
  };
};

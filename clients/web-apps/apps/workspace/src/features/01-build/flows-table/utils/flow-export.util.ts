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

  return {
    agent: {
      name: loadFlow.name,
      type: loadFlow.type,
      description: loadFlow.description ?? "",
    },
    reactFlowObject: {
      ...parseJsonObject(loadFlow.reactFlowObject),
      flowVariablesObject,
      inputOutputObject,
      ...(loadFlow.supportedPlatform ? { supportedPlatform: loadFlow.supportedPlatform } : {}),
    },
  };
};

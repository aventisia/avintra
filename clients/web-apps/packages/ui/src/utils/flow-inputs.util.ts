import type { FlowVariablesEntry } from "./flow-variables.type";

/** Reserved node id for the flow-level input variables entry. */
export const FLOW_INPUTS_NODE_ID = "__flow__";

type InputOutputField = {
  direction?: unknown;
  name?: unknown;
};

const parseInputOutputObject = (inputOutputObject: unknown[] | string): InputOutputField[] => {
  if (typeof inputOutputObject === "string") {
    try {
      const parsed = JSON.parse(inputOutputObject);
      return Array.isArray(parsed) ? (parsed as InputOutputField[]) : [];
    } catch {
      return [];
    }
  }

  return Array.isArray(inputOutputObject) ? (inputOutputObject as InputOutputField[]) : [];
};

const getFlowInputNames = (inputOutputObject: unknown[] | string): string[] =>
  Array.from(
    new Set(
      parseInputOutputObject(inputOutputObject)
        .filter((field) => field?.direction === "Input")
        .map((field) => field?.name)
        .filter((name): name is string => typeof name === "string"),
    ),
  );

const buildFlowInputsVariableEntry = (names: string[]): FlowVariablesEntry | null =>
  names.length > 0 ? { nodeId: FLOW_INPUTS_NODE_ID, outputs: names } : null;

/**
 * Replaces any flow-level variables entry with one derived from `inputOutputObject`.
 * Returns the original array when the result is unchanged.
 */
export const applyFlowInputsToVariables = (
  variables: FlowVariablesEntry[],
  inputOutputObject: unknown[] | string,
): FlowVariablesEntry[] => {
  const withoutFlowInputs = variables.filter((variable) => variable.nodeId !== FLOW_INPUTS_NODE_ID);
  const flowInputsEntry = buildFlowInputsVariableEntry(getFlowInputNames(inputOutputObject));
  const nextVariables = flowInputsEntry
    ? [...withoutFlowInputs, flowInputsEntry]
    : withoutFlowInputs;

  const isUnchanged =
    nextVariables.length === variables.length &&
    nextVariables.every((variable, index) => variable === variables[index]);

  return isUnchanged ? variables : nextVariables;
};

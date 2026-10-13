import { DCPFieldSchemaType } from "@/features/dynamic-config-panel";
import { FlowVariablesObjectType } from "@/types/flow-variables-object-type";

/** Reserved node id for the flow-level input variables entry. */
export const FLOW_INPUTS_NODE_ID = "__flow__";

const parseInputOutputObject = (
  inputOutputObject: DCPFieldSchemaType[] | string | unknown[],
): DCPFieldSchemaType[] => {
  if (typeof inputOutputObject === "string") {
    try {
      const parsed = JSON.parse(inputOutputObject);
      return Array.isArray(parsed) ? (parsed as DCPFieldSchemaType[]) : [];
    } catch {
      return [];
    }
  }

  return Array.isArray(inputOutputObject) ? (inputOutputObject as DCPFieldSchemaType[]) : [];
};

/** Returns the deduplicated names of the Input fields declared in an input/output definition. */
export const getFlowInputNamesFromInputOutputObject = (
  inputOutputObject: DCPFieldSchemaType[] | string | unknown[],
): string[] =>
  Array.from(
    new Set(
      parseInputOutputObject(inputOutputObject)
        .filter((field) => field?.direction === "Input")
        .map((field) => field?.name)
        .filter((name): name is string => typeof name === "string"),
    ),
  );

/** Builds the single flow-input variables entry, or null when there are no inputs. */
export const buildFlowInputsVariableEntry = (names: string[]): FlowVariablesObjectType | null =>
  names.length > 0 ? { nodeId: FLOW_INPUTS_NODE_ID, outputs: names } : null;

/**
 * Replaces any flow-level variables entry with one derived from `inputOutputObject`.
 * Returns the original array when the result is unchanged.
 */
export const applyFlowInputsToVariables = (
  variables: FlowVariablesObjectType[],
  inputOutputObject: DCPFieldSchemaType[] | string | unknown[],
): FlowVariablesObjectType[] => {
  const withoutFlowInputs = variables.filter((variable) => variable.nodeId !== FLOW_INPUTS_NODE_ID);
  const flowInputsEntry = buildFlowInputsVariableEntry(
    getFlowInputNamesFromInputOutputObject(inputOutputObject),
  );
  const nextVariables = flowInputsEntry
    ? [...withoutFlowInputs, flowInputsEntry]
    : withoutFlowInputs;

  const isUnchanged =
    nextVariables.length === variables.length &&
    nextVariables.every((variable, index) => variable === variables[index]);

  return isUnchanged ? variables : nextVariables;
};

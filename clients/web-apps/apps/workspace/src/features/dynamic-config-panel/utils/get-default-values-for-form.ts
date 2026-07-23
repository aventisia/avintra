import { DCPFieldSchemaType } from "..";
import { NodeInputType, NodeOutputType } from "../types/input-output-types";

export function getDefaultValuesForForm(
  nodeConfig: DCPFieldSchemaType[],
  inputs?: NodeInputType[],
  outputs?: NodeOutputType[],
): Record<string, unknown> {
  const inputMap = inputs ? Object.fromEntries(inputs?.map((i) => [i.key, i.value])) : {};
  const outputMap = outputs ? Object.fromEntries(outputs?.map((o) => [o.key, o.value])) : {};

  const defaultValues: Record<string, unknown> = {};

  for (const field of nodeConfig) {
    const key = field.name;

    if (field.direction === "Input") {
      defaultValues[key] = inputMap[key] ?? field.defaultValue;
    } else if (field.direction === "Output") {
      defaultValues[key] = outputMap[key] ?? field.defaultValue;
    }
  }

  return defaultValues;
}

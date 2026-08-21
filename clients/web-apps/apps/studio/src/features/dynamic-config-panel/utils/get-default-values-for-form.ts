import { NodeInputType, NodeOutputType } from "@/types/node-data-type";

import { DCPFieldSchemaType } from "..";

export function getDefaultValuesForForm(
  nodeConfig: DCPFieldSchemaType[],
  inputs: NodeInputType[],
  outputs: NodeOutputType[],
): Record<string, unknown> {
  const inputMap = Object.fromEntries(inputs.map((i) => [i.key, i.value]));
  const outputMap = Object.fromEntries(outputs.map((o) => [o.key, o.value]));

  const defaultValues: Record<string, unknown> = {};

  for (const field of nodeConfig) {
    const key = field.name;

    if (field.direction === "Input") {
      // Prefer input value from nodeData, fallback to field defaultValue
      defaultValues[key] = inputMap[key] ?? field.defaultValue;
    } else if (field.direction === "Output") {
      // Prefer output value from nodeData, fallback to field defaultValue
      defaultValues[key] = outputMap[key] ?? field.defaultValue;
    }
  }

  return defaultValues;
}

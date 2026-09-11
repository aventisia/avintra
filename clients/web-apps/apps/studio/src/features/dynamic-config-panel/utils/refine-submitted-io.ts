import { NodeInputType, NodeOutputType, NodeOutputValueType } from "@/types/node-data-type";

import { stringifyIfValidJson } from "./valid-json-utils";

export function refineSubmittedIO(
  _nodeUniqueName: string,
  formData: Record<string, unknown>,
  inputKeys: string[],
  outputKeys: string[],
): { inputs: NodeInputType[]; outputs: NodeOutputType[] } {
  // Extracts inputs
  const inputs: NodeInputType[] = inputKeys.map((key) => {
    let value = formData[key];
    // Date-time pickers emit a Date; serialize to ISO 8601 so the stored/transported
    // node input stays a plain string (matching the runtime node's parse expectations).
    if (value instanceof Date && !Number.isNaN(value.getTime())) {
      value = value.toISOString();
    }
    return {
      key,
      value: stringifyIfValidJson(value),
    };
  });

  // Extracts outputs
  const outputs: NodeOutputType[] = outputKeys.map((key) => ({
    key,
    value: formData[key] as NodeOutputValueType,
  }));

  return { inputs, outputs };
}

import { NodeInputType, NodeOutputType, NodeOutputValueType } from "@/types/node-data-type";

import { stringifyIfValidJson } from "./valid-json-utils";

export function refineSubmittedIO(
  _nodeUniqueName: string,
  formData: Record<string, unknown>,
  inputKeys: string[],
  outputKeys: string[],
): { inputs: NodeInputType[]; outputs: NodeOutputType[] } {
  // Extracts inputs
  const inputs: NodeInputType[] = inputKeys.map((key) => ({
    key,
    value: stringifyIfValidJson(formData[key]),
  }));

  // Extracts outputs
  const outputs: NodeOutputType[] = outputKeys.map((key) => ({
    key,
    value: formData[key] as NodeOutputValueType,
  }));

  return { inputs, outputs };
}

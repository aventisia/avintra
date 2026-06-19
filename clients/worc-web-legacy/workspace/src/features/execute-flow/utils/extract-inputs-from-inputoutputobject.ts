import { DCPFieldSchemaType } from "@/features/dynamic-config-panel/types/dcp-field-schema-type";

import { NodeInputType } from "../types/node-input-type";

export function extractInputsFromInputOutputObject(
  inputOutputObject: string,
): NodeInputType[] {
  try {
    const items: DCPFieldSchemaType[] = JSON.parse(inputOutputObject);

    if (!Array.isArray(items)) {
      console.warn("inputOutputObject is not an array");
      return [];
    }

    return items
      .filter((item) => item.direction === "Input")
      .map((item) => ({
        key: item.name,
        value: item.defaultValue,
      }));
  } catch (error) {
    console.error("Failed to parse inputOutputObject:", error);
    return [];
  }
}

import { DCPFieldSchemaType } from "@/features/dynamic-config-panel/types/dcp-field-schema-type";

import { NodeInputType } from "../types/node-input-type";

/**
 * Parses an inputOutputObject string and extracts only Input items
 * @param inputOutputObject - JSON string containing array of input/output definitions
 * @returns Array of NodeInputType with name as key and defaultValue as value
 */
export function extractInputsFromInputOutputObject(inputOutputObject: string): NodeInputType[] {
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

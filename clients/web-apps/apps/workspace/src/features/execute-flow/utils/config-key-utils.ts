import { Node } from "@xyflow/react";

import { NodeDataType } from "@/types/node-data-type";

/**
 * Extracts unique configuration keys from the inputs of an array of nodes.
 *
 * @param nodes - The array of nodes containing inputs with potential config keys.
 * @returns An array of unique configuration keys (e.g., ["KEY1", "KEY2", "KEY3"]).
 */
export function extractUniqueConfigKeys(nodes: Node<NodeDataType>[]): string[] {
  // Flatten the inputs from all nodes, extract config keys, and ensure uniqueness
  const allKeys = nodes
    ?.flatMap((node) => node?.data?.inputs?.map((input) => input?.value) || []) // Extract values from inputs
    ?.flatMap((value) => {
      if (typeof value === "string") {
        // Match and extract all {{__config__Key}} format keys
        const matches = value.match(/\{\{__config__([^}]+)\}\}/g);
        // If there are matches, extract the keys and return them as an array
        return matches
          ? matches.map((match) => match.replace(/\{\{__config__(.*?)\}\}/, "$1"))
          : [];
      }
      return []; // If value is not a string, return an empty array
    });

  // Return unique keys
  return [...new Set(allKeys)];
}

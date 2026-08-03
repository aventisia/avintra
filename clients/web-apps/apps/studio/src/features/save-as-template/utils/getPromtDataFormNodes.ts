import { Node } from "@xyflow/react";

import { CustomNodeType } from "@/types/custom-node-type";
import { NodeDataType } from "@/types/node-data-type";

// Define the allowed node types to filter relevant nodes
const allowedNodeTypes: CustomNodeType[] = [
  "callAgentNode",
  "blockNode",
  "aiNode",
  "conditionalNode",
  "forLoopNode",
  "activityNode",
  "cloudConnectorNode",
];

/**
 * Extracts and simplifies relevant node data to be used in prompts.
 *
 * - Only includes nodes with specific types (from `allowedNodeTypes`)
 * - Omits any properties (label, description, inputs, outputs) that are:
 *   - Empty strings
 *   - null or undefined
 *   - Empty arrays
 *
 * @param nodes - Array of React Flow nodes
 * @returns Cleaned array of node data objects for prompts
 */
export function getPromptDataFromNodes(
  nodes: Node<NodeDataType>[],
  allowAllNodes: boolean = false,
) {
  return nodes
    .filter((node) => allowAllNodes || allowedNodeTypes.includes(node?.data?.type)) // Filter only allowed node types
    .map((node) => {
      const data = node.data;
      const result: Record<string, unknown> = {};

      // Include 'label' only if it's a non-empty trimmed string
      const label = data?.label?.trim();
      if (label) {
        result.label = label;
      }

      // Include 'description' only if it's a non-empty trimmed string
      const description = data?.description?.trim();
      if (description) {
        result.description = description;
      }

      // Extract input keys if present and non-empty
      const inputKeys = Array.isArray(data?.inputs)
        ? data.inputs.map((input) => input.key).filter(Boolean)
        : [];
      if (inputKeys.length > 0) {
        result.inputs = allowAllNodes ? data?.inputs : inputKeys;
      }

      // Extract output keys if present and non-empty
      const outputKeys = Array.isArray(data?.outputs)
        ? data.outputs.map((output) => output.key).filter(Boolean)
        : [];
      if (outputKeys.length > 0) {
        result.outputs = allowAllNodes ? data?.outputs : outputKeys;
      }

      if (allowAllNodes) {
        result.type = node?.type;
      }

      return result;
    });
}

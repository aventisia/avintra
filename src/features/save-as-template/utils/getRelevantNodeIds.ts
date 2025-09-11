import { NodeDataType } from "@/types/node-data-type";
import { Node } from "@xyflow/react";

/**
 *
 * @param nodes - The array of React Flow nodes to process
 * @returns An array of string IDs extracted from relevant nodes
 *
 * - `callAgentNode` → Extracts `data.selectedAgent.id`
 * - `aiNode`        → Extracts `data.selectedModel.id`
 * - `blockNode`     → Extracts `data.selectedBlock.id`
 */
export function getRelevantNodeIds(nodes: Node<NodeDataType>[]): string[] {
  return nodes
    .map((node) => {
      switch (node.type) {
        case "callAgentNode":
          return node.data?.selectedAgent?.id ?? null;

        case "aiNode":
          return node.data?.selectedModel?.id ?? null;

        case "blockNode":
          return node.data?.selectedBlock?.id ?? null;

        default:
          return null; // Skip irrelevant node types
      }
    })
    .filter((id): id is string => typeof id === "string");
}

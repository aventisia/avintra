import { Node } from "@xyflow/react";

import { NodeDataType } from "@/types/node-data-type";

/**
 * Extracts selected entities (agent, model, or block) from specific node types in a React Flow graph.
 *
 * @param nodes - Array of React Flow nodes to process
 * @returns An array of selected entity objects (`selectedAgent`, `selectedModel`, or `selectedBlock`)
 *          from relevant nodes. Irrelevant nodes are skipped.
 *
 * Extraction rules by node type:
 * - `callAgentNode` → Returns `data.selectedAgent`
 * - `aiNode`        → Returns `data.selectedModel`
 * - `blockNode`     → Returns `data.selectedBlock`
 */
export function getSelectedEntitiesFromNodes(
  nodes: Node<NodeDataType>[],
): { [key: string]: string }[] {
  return nodes
    .map((node) => {
      switch (node.type) {
        case "callAgentNode":
          return node.data?.selectedAgent ?? null;

        case "aiNode":
          return node.data?.selectedModel ?? null;

        case "blockNode":
          return node.data?.selectedBlock ?? null;

        default:
          return null;
      }
    })
    .filter((i): i is { [key: string]: string } => i !== null);
}

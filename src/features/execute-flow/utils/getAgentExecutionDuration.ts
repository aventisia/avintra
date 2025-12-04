import { ExecutionNode } from "@/types/execution-types";

/**
 * Calculates the total duration of nodes, excluding specified node types.
 *
 * @param nodes - List of execution nodes
 * @param excludedNodeNames - Node names to exclude from the calculation
 * @returns Total duration excluding specified node types
 */
export function getAgentExecutionDuration(
  nodes: ExecutionNode[],
  excludedNodeNames: string[] = [],
): number {
  return nodes
    .filter((node) => !excludedNodeNames.includes(node.nodeUniqueName))
    .reduce((sum, node) => sum + node.duration, 0);
}

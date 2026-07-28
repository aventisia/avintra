import { NodeDataType } from "@/types/node-data-type";

import { Node } from "@xyflow/react";

/**
 * Support/placeholder node types that are not considered as executable nodes.
 * If a flow contains only these types of nodes, it will be treated as an empty flow.
 */
const SUPPORT_NODE_TYPES = new Set([
  "triggerNode",
  "plusNode",
  "plusFirstNode",
  "mergeBranchesNode",
  "branchStartNode",
  "branchNode1",
  "branchEndNode",
  "flowEndNode",
]);

/**
 * Determine if a flow contains desktop-only executable nodes based on their type and supported platforms.
 * Examples rejected: [windows], [linux], [windows, linux].
 * Examples allowed: [cloud, windows], [cloud], [cloud, linux], [cloud, windows, linux], [].
 * Note: If supportedPlatforms property is missing or empty, we will consider the node as cross-platform and allow it to be executed.
 */
export const doesFlowContainAnyDesktopOnlyNode = (
  nodes: Node<NodeDataType>[],
): boolean => {
  const desktopOnlyNodeCount = nodes.filter((node) => {
    // Skip support node types since they are not executable nodes
    if (SUPPORT_NODE_TYPES.has(node.type || "")) return false;

    // Skip if node is disabled
    if (node.data?.isDisabled === true) return false;

    // If supportedPlatforms is missing or empty or contains "cloud", consider the node executable on cloud
    const supportedPlatforms = node.data?.supportedPlatforms;
    return (
      supportedPlatforms &&
      supportedPlatforms.length > 0 &&
      !supportedPlatforms.includes("cloud")
    );
  }).length;

  return desktopOnlyNodeCount > 0;
};

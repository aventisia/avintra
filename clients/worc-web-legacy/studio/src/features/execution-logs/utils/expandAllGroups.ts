import { Edge, Node } from "@xyflow/react";

import { syncModelNodeVisibility } from "@/features/react-flow/hooks/useGroupToggle";

export function expandAllGroups(
  nodes: Node[],
  edges: Edge[],
): {
  nodes: Node[];
  edges: Edge[];
} {
  const expandedNodes = nodes.map((node) => {
    if (!node.data?.groupId) {
      return node;
    }

    return {
      ...node,
      hidden: false,
      data: {
        ...node.data,
        ...(node.data.isGroupHead ? { isExpanded: true } : {}),
      },
    };
  });

  return {
    nodes: syncModelNodeVisibility(expandedNodes),
    edges: edges.filter((e) => !e.data?.isTemporary),
  };
}

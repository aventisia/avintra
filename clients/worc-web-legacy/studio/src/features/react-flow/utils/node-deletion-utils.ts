import { Edge, Node } from "@xyflow/react";
import { MARKER_ARROW_PREFIX } from "@/constants";
import { getIntermediateNodeIds } from "./getIntermediateNodes";
import { getBranchSubgraphNodeIds } from "./getBranchSubNodeIds";

/**
 * Removes any topological duplicate edges before they can hit the graph.
 * Ensures the RPA execution engine receives a clean DAG.
 */
export const deduplicateEdges = (edges: Edge[]): Edge[] => {
  const seen = new Set<string>();
  return edges.filter((edge) => {
    const key = `${edge.source}::${edge.sourceHandle || ""}->${edge.target}::${edge.targetHandle || ""}`;
    if (seen.has(key)) return false;
    seen.add(key);
    return true;
  });
};

/**
 * Rebuilds UI bypass edges for collapsed groups based on true math boundaries.
 */
export const rebuildBypassEdges = (nodes: Node[], edges: Edge[]): Edge[] => {
  const cleanEdges = edges.filter((e) => !e.data?.isTemporary);
  const finalEdges = [...cleanEdges];

  const collapsedGroupHeads = nodes.filter(
    (n) =>
      n.data?.groupId && n.data?.isGroupHead && n.data?.isExpanded === false,
  );

  collapsedGroupHeads.forEach((head) => {
    const groupId = head.data!.groupId as string;
    const groupNodeIds = new Set(
      nodes.filter((n) => n.data?.groupId === groupId).map((n) => n.id),
    );

    const groupLastNode = nodes.find(
      (gn) =>
        gn.data?.groupId === groupId &&
        !cleanEdges.some(
          (e) => e.source === gn.id && groupNodeIds.has(e.target),
        ),
    );

    if (groupLastNode) {
      const outgoingEdges = cleanEdges.filter(
        (e) => e.source === groupLastNode.id && !groupNodeIds.has(e.target),
      );
      outgoingEdges.forEach((outEdge) => {
        finalEdges.push({
          id: `temp-${groupId}-${outEdge.target}`,
          source: head.id,
          target: outEdge.target,
          markerEnd: `${MARKER_ARROW_PREFIX}temp-${groupId}-${outEdge.target}`,
          deletable: true,
          label: "plus",
          data: {
            isTemporary: true,
            originalSource: outEdge.source,
            originalTarget: outEdge.target,
            groupId,
          },
        });
      });
    }
  });

  return finalEdges;
};

/**
 * Finds all related structural boundaries (Groups, Subgraphs)
 * given an initial array of selected Node IDs.
 */
export const getComprehensiveSelection = (
  initialIds: string[],
  currentNodes: Node[],
  currentEdges: Edge[],
): string[] => {
  const selectedSet = new Set(initialIds);
  let size = 0;

  while (selectedSet.size !== size) {
    size = selectedSet.size;

    currentNodes.forEach((node) => {
      if (selectedSet.has(node.id)) {
        // Rule 1: Group Bounds
        if (node.data?.groupId && node.data?.isGroupHead) {
          currentNodes
            .filter((n) => n.data?.groupId === node.data!.groupId)
            .forEach((n) => selectedSet.add(n.id));
        }

        // Rule 2: Subgraph Bounds (Loops/Conditions)
        if (node.data?.mergeBranchesNodeId) {
          if (node.type === "conditionalNode" || node.type === "forLoopNode") {
            getIntermediateNodeIds(currentNodes, currentEdges, node.id).forEach(
              (id) => selectedSet.add(id),
            );
          } else if (node.type === "branchNode1") {
            getBranchSubgraphNodeIds(
              currentNodes,
              currentEdges,
              node.id,
              node.data.mergeBranchesNodeId as string,
            ).forEach((id) => selectedSet.add(id));
          }
        }
      }
    });
  }
  return Array.from(selectedSet);
};

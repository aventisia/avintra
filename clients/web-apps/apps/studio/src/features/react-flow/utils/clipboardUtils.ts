import { Edge, Node } from "@xyflow/react";

/**
 * Deep clones the clipboard subgraph.
 * Generates new UUIDs and maps all internal relational data (loops, branches)
 * to ensure the new pasted graph is completely independent of the original.
 */
export const generatePastedSubgraph = (
  clipboardNodes: Node[],
  clipboardEdges: Edge[],
  originalEntryId: string,
  originalExitId: string,
) => {
  const idMap = new Map<string, string>();
  const edgeIdMap = new Map<string, string>();
  const clipboardNodeIds = new Set(clipboardNodes.map((n) => n.id));

  // 1. Generate new UUIDs for all nodes and edges
  clipboardNodes.forEach((node) => idMap.set(node.id, window.crypto.randomUUID()));
  clipboardEdges.forEach((edge) => edgeIdMap.set(edge.id, window.crypto.randomUUID()));

  // 2. Map nodes and deep-clone internal relational data payloads
  const newNodes = clipboardNodes.map((node) => {
    const newId = idMap.get(node.id)!;
    const newData = { ...node.data };

    if (newData.mergeBranchesNodeId && typeof newData.mergeBranchesNodeId === "string") {
      newData.mergeBranchesNodeId =
        idMap.get(newData.mergeBranchesNodeId) || newData.mergeBranchesNodeId;
    }

    // Isolate groups: Only keep groupId if the parent group head was also copied.
    // This prevents newly pasted nodes from teleporting into the original group container.
    if (newData.groupId && typeof newData.groupId === "string") {
      if (clipboardNodeIds.has(newData.groupId)) {
        newData.groupId = idMap.get(newData.groupId) || newData.groupId;
      } else {
        delete newData.groupId;
      }
    }

    if (Array.isArray(newData.branches)) {
      newData.branches = newData.branches.map((bId: string) => idMap.get(bId) || bId);
    }

    if (newData.defaultBranchNodeId && typeof newData.defaultBranchNodeId === "string") {
      newData.defaultBranchNodeId =
        idMap.get(newData.defaultBranchNodeId) || newData.defaultBranchNodeId;
    }

    // Remap the conditional node's internal reference to its default branch edge
    if (
      newData.conditional2DefaultBranchEdgeId &&
      typeof newData.conditional2DefaultBranchEdgeId === "string"
    ) {
      newData.conditional2DefaultBranchEdgeId =
        edgeIdMap.get(newData.conditional2DefaultBranchEdgeId) ||
        newData.conditional2DefaultBranchEdgeId;
    }

    // Remap customParentId for Branch End Nodes
    if (newData.customParentId && typeof newData.customParentId === "string") {
      newData.customParentId = idMap.get(newData.customParentId) || newData.customParentId;
    }

    // Safely remap the native React Flow parentId if it exists on the node
    const mappedParentId =
      node.parentId && typeof node.parentId === "string"
        ? idMap.get(node.parentId) || node.parentId
        : undefined;

    const newNode: Node = { ...node, id: newId, selected: true, data: newData };

    if (mappedParentId) {
      newNode.parentId = mappedParentId;
    }

    return newNode;
  });

  // 3. Map edges and safely clone custom SVG marker IDs
  const newEdges = clipboardEdges.map((edge) => {
    const newEdgeId = edgeIdMap.get(edge.id)!;
    const newEdge = {
      ...edge,
      id: newEdgeId,
      source: idMap.get(edge.source) || edge.source,
      target: idMap.get(edge.target) || edge.target,
    };

    // Replace old edge IDs in marker strings so custom arrows render correctly on the new edges
    if (edge.markerEnd && typeof edge.markerEnd === "string") {
      newEdge.markerEnd = edge.markerEnd.replace(edge.id, newEdgeId);
    }

    return newEdge;
  });

  return {
    newNodes,
    newEdges,
    entryNodeId: idMap.get(originalEntryId) || newNodes[0].id,
    exitNodeId: idMap.get(originalExitId) || newNodes[newNodes.length - 1].id,
    idMap, // Exported to allow useFlowOperations to clone flow variables
  };
};

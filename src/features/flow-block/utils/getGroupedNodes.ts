import { Edge, Node } from "@xyflow/react";

const getGroupContents = ({
  edges,
  groupNodeId,
  nodes,
}: {
  nodes: Node[];
  edges: Edge[];
  groupNodeId: string;
}) => {
  // Find the groupId from the given node ID
  const groupNode = nodes.find((node) => node.id === groupNodeId);
  if (!groupNode?.data?.groupId) {
    console.warn("Node is not a group head or part of a group");
    return { nodes: [], edges: [] };
  }

  const groupId = groupNode.data.groupId as string;

  // Find all nodes in the same group
  const groupNodes = nodes.filter((node) => node?.data?.groupId === groupId);

  // Find edges connected to nodes in the group (optional: only include temporary/group edges)
  const groupNodeIds = new Set(groupNodes.map((n) => n.id));
  const groupEdges = edges.filter(
    (edge) =>
      (groupNodeIds.has(edge.source) || groupNodeIds.has(edge.target)) &&
      edge.data?.isTemporary &&
      edge.id.includes(groupId),
  );

  return { nodes: groupNodes, edges: groupEdges };
};

export { getGroupContents };

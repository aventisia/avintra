import { Edge, Node } from "@xyflow/react";
import { FlowVariablesObjectType } from "@/types/flow-variables-object-type";

export interface HistoryState {
  /** Snapshot of nodes at a specific point in time */
  nodes: Node[];
  /** Snapshot of edges at a specific point in time */
  edges: Edge[];
  /** Snapshot of flow variables at a specific point in time */
  flowVariablesObject: FlowVariablesObjectType[];
}

/**
 * Evaluates if a state change represents a mathematical or structural difference.
 * Leverages strict reference equality to bypass deep JSON comparisons for unmodified nodes.
 */
export const isHistoryEqual = (
  past: HistoryState,
  current: HistoryState,
): boolean => {
  if (past?.nodes?.length !== current?.nodes?.length) return false;
  if (past?.edges?.length !== current?.edges?.length) return false;
  if (
    past?.flowVariablesObject?.length !== current?.flowVariablesObject?.length
  )
    return false;

  if (past.flowVariablesObject !== current.flowVariablesObject) {
    if (
      JSON.stringify(past.flowVariablesObject) !==
      JSON.stringify(current.flowVariablesObject)
    )
      return false;
  }

  const pastNodeMap = new Map(past.nodes.map((n) => [n.id, n]));

  for (const cNode of current.nodes) {
    const pNode = pastNodeMap.get(cNode.id);
    if (!pNode) return false;

    // Bypass deep comparison if the memory reference is identical
    if (pNode === cNode) continue;

    if (pNode.type !== cNode.type || pNode.hidden !== cNode.hidden)
      return false;
    if (
      pNode.position.x !== cNode.position.x ||
      pNode.position.y !== cNode.position.y
    )
      return false;

    if (pNode.data !== cNode.data) {
      if (JSON.stringify(pNode.data) !== JSON.stringify(cNode.data))
        return false;
    }
  }

  const pastEdgeMap = new Map(past.edges.map((e) => [e.id, e]));

  for (const cEdge of current.edges) {
    const pEdge = pastEdgeMap.get(cEdge.id);
    if (!pEdge) return false;

    if (pEdge === cEdge) continue;

    if (
      pEdge.source !== cEdge.source ||
      pEdge.target !== cEdge.target ||
      pEdge.sourceHandle !== cEdge.sourceHandle ||
      pEdge.targetHandle !== cEdge.targetHandle
    )
      return false;

    if (pEdge.data !== cEdge.data) {
      if (JSON.stringify(pEdge.data) !== JSON.stringify(cEdge.data))
        return false;
    }
  }

  return true;
};

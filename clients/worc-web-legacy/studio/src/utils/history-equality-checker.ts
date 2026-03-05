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
  // 1. FAST STRUCTURAL CHECKS
  if (past === current) return true;
  if (past.nodes.length !== current.nodes.length) return false;
  if (past.edges.length !== current.edges.length) return false;
  if (past.flowVariablesObject.length !== current.flowVariablesObject.length)
    return false;

  // 3. NODES CHECK
  if (past.nodes !== current.nodes) {
    const pastNodeMap = new Map(past.nodes.map((n) => [n.id, n]));

    for (const cNode of current.nodes) {
      const pNode = pastNodeMap.get(cNode.id);
      if (!pNode) return false;

      if (pNode === cNode) continue;

      // Ignore 'selected' or 'dragging' state changes natively by not checking them
      if (
        pNode.type !== cNode.type ||
        pNode.hidden !== cNode.hidden ||
        pNode.position.x !== cNode.position.x ||
        pNode.position.y !== cNode.position.y
      ) {
        return false;
      }

      // Deep compare data only if the memory reference changed
      if (pNode.data !== cNode.data) {
        if (JSON.stringify(pNode.data) !== JSON.stringify(cNode.data))
          return false;
      }
    }
  }

  if (past.edges !== current.edges) {
    return false;
  }

  return true;
};

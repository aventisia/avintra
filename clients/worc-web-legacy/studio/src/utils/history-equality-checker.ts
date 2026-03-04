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
 * Highly optimized: Leverages strict reference equality to bypass deep JSON
 * comparisons for unmodified nodes/edges, keeping operations lightning fast.
 */
export const isHistoryEqual = (
  past: HistoryState,
  current: HistoryState,
): boolean => {
  // 1. FAST STRUCTURAL CHECKS
  // If the entire state object is the exact same memory reference, it is identical
  if (past === current) return true;

  // If the array lengths changed, an item was added or deleted
  if (past.nodes.length !== current.nodes.length) return false;
  if (past.edges.length !== current.edges.length) return false;
  if (past.flowVariablesObject.length !== current.flowVariablesObject.length)
    return false;

  // 2. FLOW VARIABLES CHECK
  if (past.flowVariablesObject !== current.flowVariablesObject) {
    if (
      JSON.stringify(past.flowVariablesObject) !==
      JSON.stringify(current.flowVariablesObject)
    ) {
      return false;
    }
  }

  // 3. NODES CHECK
  // Only check nodes if the nodes array memory reference changed
  if (past.nodes !== current.nodes) {
    const pastNodeMap = new Map(past.nodes.map((n) => [n.id, n]));

    for (const cNode of current.nodes) {
      const pNode = pastNodeMap.get(cNode.id);

      // Node was replaced/removed
      if (!pNode) return false;

      // Bypass deep comparison entirely if the memory reference is identical
      if (pNode === cNode) continue;

      // Check primitive surface values first
      if (
        pNode.type !== cNode.type ||
        pNode.hidden !== cNode.hidden ||
        pNode.position.x !== cNode.position.x ||
        pNode.position.y !== cNode.position.y
      ) {
        return false;
      }

      // Deep compare data ONLY if the specific node's data reference changed
      if (pNode.data !== cNode.data) {
        if (JSON.stringify(pNode.data) !== JSON.stringify(cNode.data))
          return false;
      }
    }
  }

  // 4. EDGES CHECK
  // Only check edges if the edges array memory reference changed
  if (past.edges !== current.edges) {
    const pastEdgeMap = new Map(past.edges.map((e) => [e.id, e]));

    for (const cEdge of current.edges) {
      const pEdge = pastEdgeMap.get(cEdge.id);

      if (!pEdge) return false;

      // Bypass deep comparison entirely if the memory reference is identical
      if (pEdge === cEdge) continue;

      // Check structural values first
      if (
        pEdge.source !== cEdge.source ||
        pEdge.target !== cEdge.target ||
        pEdge.sourceHandle !== cEdge.sourceHandle ||
        pEdge.targetHandle !== cEdge.targetHandle
      ) {
        return false;
      }

      // Deep compare data ONLY if the specific edge's data reference changed
      if (pEdge.data !== cEdge.data) {
        if (JSON.stringify(pEdge.data) !== JSON.stringify(cEdge.data))
          return false;
      }
    }
  }

  return true;
};

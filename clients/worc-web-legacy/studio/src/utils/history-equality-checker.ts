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
 * Evaluates if a state change is mathematically relevant to the RPA execution.
 * Returns true if the states are effectively identical (skip saving).
 * Returns false if a structural or data change occurred (save to history).
 * * @param {HistoryState} past - The previously saved history state
 * @param {HistoryState} current - The current active state
 * @returns {boolean} True if states are equal, false otherwise
 */
export const isHistoryEqual = (
  past: HistoryState,
  current: HistoryState,
): boolean => {
  // Structural Add/Delete: Check if nodes or edges were added or removed
  if (past.nodes.length !== current.nodes.length) return false;
  if (past.edges.length !== current.edges.length) return false;
  if (past.flowVariablesObject.length !== current.flowVariablesObject.length)
    return false;

  // Variable Updates: Check if configuration scripts or variables changed
  if (
    JSON.stringify(past.flowVariablesObject) !==
    JSON.stringify(current.flowVariablesObject)
  )
    return false;

  // Create O(1) maps to neutralize React Flow's native array re-ordering (z-index shifts)
  const pastNodeMap = new Map(past.nodes.map((n) => [n.id, n]));
  const pastEdgeMap = new Map(past.edges.map((e) => [e.id, e]));

  // 4. Deep Node Check: Validate if the actual RPA block data changed
  for (const cNode of current.nodes) {
    const pNode = pastNodeMap.get(cNode.id);
    if (!pNode) return false;

    if (pNode.type !== cNode.type) return false;
    if (pNode.hidden !== cNode.hidden) return false;
    if (JSON.stringify(pNode.position) !== JSON.stringify(cNode.position))
      return false;

    // Strictly check data. Ignore selected.
    if (JSON.stringify(pNode.data) !== JSON.stringify(cNode.data)) return false;
  }

  // 5. Deep Edge Check: Validate if the topological wiring changed
  for (const cEdge of current.edges) {
    const pEdge = pastEdgeMap.get(cEdge.id);
    if (!pEdge) return false;

    if (pEdge.source !== cEdge.source) return false;
    if (pEdge.target !== cEdge.target) return false;
    if (pEdge.sourceHandle !== cEdge.sourceHandle) return false;
    if (pEdge.targetHandle !== cEdge.targetHandle) return false;
    if (JSON.stringify(pEdge.data) !== JSON.stringify(cEdge.data)) return false;
  }

  // If we reach here, it was just a selection change.
  return true;
};

import { NodeChange, EdgeChange } from "@xyflow/react";

/**
 * Evaluates React Flow node events to see if they warrant a history save.
 * Filters out intermediate states to maximize performance.
 */
export const isSignificantNodeChange = (changes: NodeChange[]): boolean => {
  return changes.some((change) => {
    // Ignore pure selection, hover, and internal dimension calculations
    if (change.type === "select" || change.type === "dimensions") return false;

    // For position changes, only trigger when the user drops the node.
    // React Flow sets dragging: true while moving, and false when dropped.
    if (change.type === "position") {
      return change.dragging === false;
    }

    // "add", "remove", and "replace" events are always significant
    return true;
  });
};

/**
 * Evaluates React Flow edge events to see if they warrant a history save.
 */
export const isSignificantEdgeChange = (changes: EdgeChange[]): boolean => {
  return changes.some((change) => change.type !== "select");
};

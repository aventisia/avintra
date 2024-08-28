import { Edge } from "@xyflow/react";

export const createEdgeObj = (
  sourceNodeId: string,
  targetNodeId: string,
): Edge => {
  return {
    id: window.crypto.randomUUID(),
    type: "customStepEdge",
    source: sourceNodeId,
    target: targetNodeId,
    deletable: true,
    selectable: true,
  } as Edge;
};

export const createEdgeWithLabelObj = (
  sourceNodeId: string,
  targetNodeId: string,
  label?: React.ReactNode,
): Edge => {
  return {
    id: window.crypto.randomUUID(),
    type: "labelStepEdge",
    label,
    source: sourceNodeId,
    target: targetNodeId,
    deletable: false,
    selectable: false,
  } as Edge;
};

export const createDottedEdgeObj = (
  sourceNodeId: string,
  targetNodeId: string,
): Edge => {
  return {
    id: window.crypto.randomUUID(),
    type: "plusNodeEdge",
    source: sourceNodeId,
    target: targetNodeId,
    deletable: false,
    selectable: false,
  } as Edge;
};

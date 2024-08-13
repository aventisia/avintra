import { NodeDataType } from "@/types/node-data-type";
import { Edge, Node } from "@xyflow/react";

export const createNewNodeObj = (
  nodeData: NodeDataType,
  sourceNode: Node | undefined,
): Node => {
  return {
    id: window.crypto.randomUUID(),
    type: nodeData.type,
    dragHandle: ".custom-drag-handle",
    data: nodeData,
    position: sourceNode?.position || { x: 0, y: 0 },
    deletable: true,
    draggable: true,
    selectable: true,
    sourcePosition: sourceNode?.sourcePosition,
  } as Node;
};

export const createNewEdgeObj = (
  sourceNodeId: string,
  targetNodeId: string,
): Edge => {
  return {
    id: window.crypto.randomUUID(),
    type: "customStepEdge",
    source: sourceNodeId,
    target: targetNodeId,
    deletable: false,
    selectable: false,
  } as Edge;
};

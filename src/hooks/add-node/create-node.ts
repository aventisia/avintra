import { NodeDataType } from "@/types/node-data-type";
import { Node } from "@xyflow/react";

export const createNodeObj = (nodeData: NodeDataType): Node => {
  return {
    id: window.crypto.randomUUID(),
    type: nodeData.type,
    dragHandle: ".custom-drag-handle",
    data: nodeData,
    position: { x: 0, y: 0 },
    deletable: true,
    draggable: true,
    selectable: true,
  } as Node;
};

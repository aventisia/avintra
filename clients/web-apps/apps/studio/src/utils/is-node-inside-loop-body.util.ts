import { Edge, Node } from "@xyflow/react";

import { getIntermediateNodeIds } from "@/features/react-flow/utils/getIntermediateNodes";
import { LoopNodeDataType } from "@/types/loop-node-data-type";

export const isNodeInsideLoopBody = (nodeId: string, nodes: Node[], edges: Edge[]): boolean =>
  nodes.some((node) => {
    if (node.type !== "forLoopNode") return false;
    const loop = node as Node<LoopNodeDataType>;
    const mergeId = loop.data?.mergeBranchesNodeId;
    if (!mergeId || node.id === nodeId || mergeId === nodeId) return false;
    return getIntermediateNodeIds(nodes, edges, node.id).includes(nodeId);
  });

import { Edge, Node } from "@xyflow/react";

import { NodeDataType } from "@/types/node-data-type";

type SubFlowGraph = {
  subFlowId: string;
  nodes: Node<NodeDataType>[];
  edges: Edge[];
};

export type { SubFlowGraph };

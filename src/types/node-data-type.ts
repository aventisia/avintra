import { CustomNodeType } from "./custom-node-type";

type NodeTypeAndCategory = {
  type: CustomNodeType;
  category: string;
};

type NodeDataType = NodeTypeAndCategory & {
  name: string;
  label: string;
  description: string;
  icon?: string;
  img?: string;
};

export type { NodeTypeAndCategory, NodeDataType };

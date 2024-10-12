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
  inputs?: {
    name: string;
    type: string;
    label: string;
    fieldType: "input" | "switch" | "select" | "textarea";
    description?: string;
    valueList?: string[]; // for fieldType: "select"
  }[];
  outputs?: {
    name: string;
    type: string;
    label: string;
    description: string;
  }[];
};

export type { NodeTypeAndCategory, NodeDataType };

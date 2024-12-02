/* eslint-disable @typescript-eslint/no-explicit-any */
import { CustomNodeType } from "./custom-node-type";

type NodeTypeAndCategory = {
  type: CustomNodeType;
  category: string;
};

type NodeDataType = {
  type: CustomNodeType;
  name: string;
  label: string;
  description: string;
  icon?: string;
  img?: string;
  fieldValues?: { [key: string]: any };
};

export type { NodeTypeAndCategory, NodeDataType };

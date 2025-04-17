/* eslint-disable @typescript-eslint/no-explicit-any */
import { CustomNodeType } from "./custom-node-type";

type NodeTypeAndCategory = {
  type: CustomNodeType;
  category: string;
};

type NodeDataInputsOutputs = {
  key: string,
  value: string | number | boolean,
}


type NodeDataType = {
  type: CustomNodeType;
  name: string;
  label: string;
  description: string;
  icon?: string;
  img?: string;
  fieldValues?: { [key: string]: any };
  inputs?: NodeDataInputsOutputs[];
  outputs?: NodeDataInputsOutputs[];
  disabled?: boolean;
  hidden?: boolean;
  formType?: "custom" | "dynamic"
};

export type { NodeTypeAndCategory, NodeDataType };

/* eslint-disable @typescript-eslint/no-explicit-any */
import { CustomNodeType } from "./custom-node-type";

type NodeTypeAndCategory = {
  type: CustomNodeType;
  category: string;
};

type NodeInputType = {
  key: string;
  value: string | number | boolean;
};

type NodeOutputType = {
  key: string;
  value: string | number | boolean;
};

type NodeDataType = {
  type: CustomNodeType;
  category?: string;
  name: string;
  label: string;
  description: string;
  docsLink?: string;
  icon?: string;
  img?: string;
  fieldValues?: { [key: string]: any };
  inputs?: NodeInputType[];
  outputs?: NodeOutputType[];
  disabled?: boolean;
  hidden?: boolean;
  formType?: "custom" | "dynamic";
};

export type {
  NodeTypeAndCategory,
  NodeInputType,
  NodeOutputType,
  NodeDataType,
};

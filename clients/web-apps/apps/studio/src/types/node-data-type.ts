/* eslint-disable @typescript-eslint/no-explicit-any */
import { DoNotRenderIfType } from "@/features/action-selector/types/do-not-render-type";

import { CustomNodeType } from "./custom-node-type";

type NodeTypeAndCategory = {
  type: CustomNodeType;
  category: string;
};

type NodeInputType = {
  key: string;
  value: unknown;
};

type NodeOutputValueType = {
  value: string | number | boolean;
  enabled: boolean;
};

type NodeOutputType = {
  key: string;
  value: NodeOutputValueType;
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
  supportedPlatforms?: string[];
  fieldValues?: { [key: string]: any };
  inputs?: NodeInputType[];
  outputs?: NodeOutputType[];
  disabled?: boolean;
  hidden?: boolean;
  doNotRenderIf?: DoNotRenderIfType;
  formType?: "custom" | "dynamic";
  isGroupHead?: boolean;
  groupId?: string;
  isExpanded?: boolean;
  count?: number;
  color?: string;
  isBlock?: boolean;
  isDisabled?: boolean;
  isCut?: boolean;
  clipboardGroupId?: string;
  clipboardGroupHead?: boolean;
  selectedAgent?: { [key: string]: string };
  selectedModel?: { [key: string]: string };
  selectedBlock?: { [key: string]: string };
  loopId?: string;
};

export type {
  NodeTypeAndCategory,
  NodeInputType,
  NodeOutputType,
  NodeOutputValueType,
  NodeDataType,
};

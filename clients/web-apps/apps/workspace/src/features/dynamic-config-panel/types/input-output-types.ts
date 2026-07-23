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

export type { NodeInputType, NodeOutputType, NodeOutputValueType };

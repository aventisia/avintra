type NodeOutputValueType = {
  value: string;
  enabled: boolean;
};

type NodeOutputType = {
  key: string;
  value: NodeOutputValueType;
};

export type { NodeOutputValueType, NodeOutputType };

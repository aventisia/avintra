export interface NodeInput {
  key: string;
  value: string;
}

export interface NodeOutputValue {
  value: string;
  enabled: boolean;
}

export interface NodeOutput {
  key: string;
  value: NodeOutputValue;
}

export interface NodeData {
  id: string;
  type: string;
  nodeName: string;
  codeActivityName: string;
  nodeInputs: NodeInput[];
  nodeOutputs: NodeOutput[];
}
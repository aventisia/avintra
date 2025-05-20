export interface NodeData {
  id: string;
  type: string;
  nodeName: string;
  codeActivityName: string;
  nodeInputs: NodeInOut[];
  nodeOutputs: NodeInOut[];
}

export interface NodeInOut {
  key: string;
  value: string;
}
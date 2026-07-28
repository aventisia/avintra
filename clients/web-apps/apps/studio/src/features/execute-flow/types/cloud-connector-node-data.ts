import { NodeInputType, NodeOutputType } from "..";
interface CloudConnectorNodeData {
  id: string;
  type: string;
  nodeName: string;
  codeActivityName: string;
  nodeInputs: NodeInputType[];
  nodeOutputs: NodeOutputType[];
  nextNodeId: string;
}

export type { CloudConnectorNodeData };

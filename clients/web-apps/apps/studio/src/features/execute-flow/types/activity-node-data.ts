import { NodeInputType, NodeOutputType } from "..";
interface ActivityNodeData {
  id: string;
  type: string;
  nodeName: string;
  codeActivityName: string;
  nodeInputs: NodeInputType[];
  nodeOutputs: NodeOutputType[];
  nextNodeId: string;
}

export type { ActivityNodeData };

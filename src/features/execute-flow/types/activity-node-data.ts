import { NodeOutputType } from "..";

type ActivityNodeInputType = {
  key: string;
  value: unknown;
};

interface ActivityNodeData {
  id: string;
  type: string;
  nodeName: string;
  codeActivityName: string;
  nodeInputs: ActivityNodeInputType[];
  nodeOutputs: NodeOutputType[];
}

export type { ActivityNodeData, ActivityNodeInputType };

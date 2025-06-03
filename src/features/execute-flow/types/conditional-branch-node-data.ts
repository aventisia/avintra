import { ConditionType } from "./condition-groups-type";

interface ConditionalBranchNodeData {
  id: string;
  type: string;
  nodeName: string;
  codeActivityName: string;
  conditions: ConditionType[][];
  conditionalNodeId: string;
  nextNodeId: string;
}

export type { ConditionalBranchNodeData };

export type NodeDataType = {
  type:
    | "triggerNode"
    | "plusNode"
    | "activityNode"
    | "ifElseNode"
    | "switchCaseNode"
    | "whileLoopNode"
    | "forLoopNode"
    | "forEachLoopNode"
    | "flowEndNode";
  category: string;
  name: string;
  label: string;
  description: string;
  Icon?: React.ReactNode;
  img?: string;
};

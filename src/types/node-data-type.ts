type NodeTypeAndCategory = {
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
};

type NodeDataType = NodeTypeAndCategory & {
  name: string;
  label: string;
  description: string;
  icon?: string;
  img?: string;
};

export type { NodeTypeAndCategory, NodeDataType };

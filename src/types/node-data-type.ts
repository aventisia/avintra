export type NodeDataType = {
  type: "triggerNode" | "plusNode" | "activityNode" | "ifElseNode";
  category: string;
  name: string;
  label: string;
  description: string;
  icon: string;
};

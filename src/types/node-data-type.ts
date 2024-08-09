export type NodeDataType = {
  type: "triggerNode" | "placeholderNode" | "activityNode";
  category: string;
  name: string;
  label: string;
  description: string;
  icon: string;
};

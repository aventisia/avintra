import { NodeDataType } from "@/types/node-data-type";

export const logicNodesList: NodeDataType[] = [
  {
    type: "ifElseNode",
    category: "Conditions",
    name: "ifElseNode",
    label: "If else",
    description: "This node represents an if-else statement.",
    icon: "ConditionalNodeIcon",
  },
  {
    type: "conditionalNode",
    category: "Conditions",
    name: "conditionalNode",
    label: "Switch case",
    description: "This node represents a switch case statement.",
    icon: "ConditionalNodeIcon",
  },
  {
    type: "whileLoopNode",
    category: "Loops",
    name: "whileLoopNode",
    label: "While loop",
    description: "This node represents a while loop.",
    icon: "LoopNodeIcon",
  },
  {
    type: "forLoopNode",
    category: "Loops",
    name: "forLoopNode",
    label: "For loop",
    description: "This node represents a for loop.",
    icon: "LoopNodeIcon",
  },
  {
    type: "forEachLoopNode",
    category: "Loops",
    name: "forEachLoopNode",
    label: "For each loop",
    description: "This node represents a for each loop.",
    icon: "LoopNodeIcon",
  },
];

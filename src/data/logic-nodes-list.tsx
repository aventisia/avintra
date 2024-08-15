import {
  ConditionalNodeIcon,
  LoopNodeIcon,
} from "@/components/node-icons/LogicalNodeIcons";
import { NodeDataType } from "@/types/node-data-type";

export const logicNodesList: NodeDataType[] = [
  {
    type: "ifElseNode",
    category: "Conditions",
    name: "ifElseNode",
    label: "If else",
    description: "This node represents an if-else statement.",
    Icon: <ConditionalNodeIcon />,
  },
  {
    type: "switchCaseNode",
    category: "Conditions",
    name: "switchCaseNode",
    label: "Switch case",
    description: "This node represents a switch case statement.",
    Icon: <ConditionalNodeIcon />,
  },
  {
    type: "whileLoopNode",
    category: "Loops",
    name: "whileLoopNode",
    label: "While loop",
    description: "This node represents a while loop.",
    Icon: <LoopNodeIcon />,
  },
  {
    type: "forLoopNode",
    category: "Loops",
    name: "forLoopNode",
    label: "For loop",
    description: "This node represents a for loop.",
    Icon: <LoopNodeIcon />,
  },
  {
    type: "forEachLoopNode",
    category: "Loops",
    name: "forEachLoopNode",
    label: "For each loop",
    description: "This node represents a for each loop.",
    Icon: <LoopNodeIcon />,
  },
];

import { FlowTypesEnum } from "@avplatform/ui/enums/flow-types-enum";
import { Blocks, type LucideIcon, MessagesSquare, Workflow } from "lucide-react";

export type FlowTypeOption = {
  value: FlowTypesEnum;
  label: string;
  description: string;
  icon: LucideIcon;
};

/**
 * Agent types offered when creating an agent.
 */
export const FLOW_TYPE_OPTIONS: FlowTypeOption[] = [
  {
    value: FlowTypesEnum.Agent,
    label: "Automation agent",
    description: "Automates tasks and processes with rules and logic",
    icon: Workflow,
  },
  {
    value: FlowTypesEnum.ChatAgent,
    label: "Chat agent",
    description: "Holds dynamic, context-aware conversations",
    icon: MessagesSquare,
  },
  {
    value: FlowTypesEnum.Block,
    label: "Block",
    description: "A reusable piece that other agents can call",
    icon: Blocks,
  },
];

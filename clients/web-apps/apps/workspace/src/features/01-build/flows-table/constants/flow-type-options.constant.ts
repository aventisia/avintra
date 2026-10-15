import { FlowTypesEnum } from "@avplatform/ui/enums/flow-types-enum";
import { ChatsIcon, CubeIcon, FlowArrowIcon, MicrophoneIcon, type Icon } from "@phosphor-icons/react";

export type FlowTypeOption = {
  value: FlowTypesEnum;
  label: string;
  description: string;
  icon: Icon;
};

/**
 * Agent types offered when creating an agent.
 */
export const FLOW_TYPE_OPTIONS: FlowTypeOption[] = [
  {
    value: FlowTypesEnum.Agent,
    label: "Automation agent",
    description: "Automates tasks and processes with rules and logic",
    icon: FlowArrowIcon,
  },
  {
    value: FlowTypesEnum.ChatAgent,
    label: "Chat agent",
    description: "Holds dynamic, context-aware conversations",
    icon: ChatsIcon,
  },
  {
    value: FlowTypesEnum.VoiceAgent,
    label: "Voice Agent",
    description:
      "A voice-driven agent flow designed for spoken conversations, handling real-time voice interactions instead of text or scheduled tasks",
    icon: MicrophoneIcon,
  },
  {
    value: FlowTypesEnum.Block,
    label: "Block",
    description: "A reusable piece that other agents can call",
    icon: CubeIcon,
  },
];

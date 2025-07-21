import {
  BrainCircuit,
  Cable,
  CalendarCheck,
  ChevronsLeftRightEllipsis,
  CircleAlert,
  Combine,
  DatabaseZap,
  FileCheck,
  Globe,
  Keyboard,
  ListCheck,
  MailCheck,
  MonitorCheck,
  MonitorCog,
  MousePointerClick,
  SquareFunction,
  TimerReset,
  Webhook,
} from "lucide-react";
import {
  BlockNodeIcon,
  CallAgentIcon,
  ConditionalNodeIcon,
  LoopNodeIcon,
} from "./LogicalNodeIcons";
import { NodesCategoryL1Icon } from "./NodesCategoryL1Icon";
import { TriggerNodeIcon } from "./TriggerNodeIcon";

export const iconMapper: { [key: string]: JSX.Element } = {
  // Nodes Categories L1
  AppIntegrationsIcon: <NodesCategoryL1Icon Icon={Cable} />,
  DataTransformationsIcon: <NodesCategoryL1Icon Icon={DatabaseZap} />,
  AutomationEssentialsIcon: <NodesCategoryL1Icon Icon={SquareFunction} />,
  UIAutomationAndUserActionsIcon: <NodesCategoryL1Icon Icon={Keyboard} />,
  IntelligentAutomationIcon: <NodesCategoryL1Icon Icon={BrainCircuit} />,
  BLockIcon: <NodesCategoryL1Icon Icon={Combine} />,

  // Logical Nodes
  ConditionalNodeIcon: <ConditionalNodeIcon />,
  LoopNodeIcon: <LoopNodeIcon />,

  CallAgentIcon: <CallAgentIcon />,
  BlockNodeIcon: <BlockNodeIcon />,

  // Trigger Nodes
  ManualTriggerIcon: <TriggerNodeIcon Icon={MousePointerClick} />,
  ScheduleTriggerIcon: <TriggerNodeIcon Icon={CalendarCheck} />,
  IntervalTriggerIcon: <TriggerNodeIcon Icon={TimerReset} />,
  FileSystemEventTrigger: <TriggerNodeIcon Icon={FileCheck} />,
  EmailTriggerIcon: <TriggerNodeIcon Icon={MailCheck} />,
  DatabaseEventTriggerIcon: <TriggerNodeIcon Icon={DatabaseZap} />,
  FormSubmissionTriggerIcon: <TriggerNodeIcon Icon={ListCheck} />,
  SystemEventTriggerIcon: <TriggerNodeIcon Icon={MonitorCheck} />,
  ServiceEventTriggerIcon: <TriggerNodeIcon Icon={MonitorCog} />,
  WebhookTriggerIcon: <TriggerNodeIcon Icon={Webhook} />,
  HttpTriggerIcon: <TriggerNodeIcon Icon={Globe} />,
  ErrorDetectionTriggerIcon: <TriggerNodeIcon Icon={CircleAlert} />,
  CustomTriggerIcon: <TriggerNodeIcon Icon={ChevronsLeftRightEllipsis} />,
};

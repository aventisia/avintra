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
  Puzzle,
  SquareFunction,
  TimerReset,
  Webhook,
} from "lucide-react";

import {
  BlockNodeIcon,
  BreakLoopNodeIcon,
  CallAgentIcon,
  ConditionalNodeIcon,
  ContinueLoopNodeIcon,
  ExitFlowNodeIcon,
  LoopNodeIcon,
} from "./LogicalNodeIcons";
import { NodesCategoryL1Icon } from "./NodesCategoryL1Icon";
import { TriggerNodeIcon } from "./TriggerNodeIcon";

export const iconMapper: { [key: string]: JSX.Element } = {
  // Nodes Categories L1
  AppIntegrationsIcon: <NodesCategoryL1Icon Icon={Cable} className="h-5 w-5 text-primary" />,
  DataTransformationsIcon: (
    <NodesCategoryL1Icon Icon={DatabaseZap} className="h-5 w-5 text-primary" />
  ),
  CustomNodesIcon: <NodesCategoryL1Icon Icon={Puzzle} className="h-5 w-5 text-primary" />,
  AutomationEssentialsIcon: (
    <NodesCategoryL1Icon Icon={SquareFunction} className="h-5 w-5 text-primary" />
  ),
  UIAutomationAndUserActionsIcon: (
    <NodesCategoryL1Icon Icon={Keyboard} className="h-5 w-5 text-primary" />
  ),
  IntelligentAutomationIcon: (
    <NodesCategoryL1Icon Icon={BrainCircuit} className="h-5 w-5 text-primary" />
  ),
  BLockIcon: <NodesCategoryL1Icon Icon={Combine} />,

  // Logical Nodes
  ConditionalNodeIcon: <ConditionalNodeIcon />,
  LoopNodeIcon: <LoopNodeIcon />,
  BreakLoopNodeIcon: <BreakLoopNodeIcon />,
  ContinueLoopNodeIcon: <ContinueLoopNodeIcon />,
  ExitFlowNodeIcon: <ExitFlowNodeIcon />,

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

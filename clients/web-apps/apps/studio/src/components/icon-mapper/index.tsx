import {
  BracketsAngleIcon,
  BrainIcon,
  CalendarCheckIcon,
  CursorClickIcon,
  DatabaseIcon,
  EnvelopeOpenIcon,
  FileTextIcon,
  FunctionIcon,
  GlobeIcon,
  IntersectSquareIcon,
  KeyboardIcon,
  ListChecksIcon,
  MonitorIcon,
  PlugsConnectedIcon,
  PuzzlePieceIcon,
  TimerIcon,
  WarningCircleIcon,
  WebhooksLogoIcon,
  WrenchIcon,
} from "@phosphor-icons/react";

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
  AppIntegrationsIcon: (
    <NodesCategoryL1Icon Icon={PlugsConnectedIcon} className="h-5 w-5 text-primary" />
  ),
  DataTransformationsIcon: (
    <NodesCategoryL1Icon Icon={DatabaseIcon} className="h-5 w-5 text-primary" />
  ),
  CustomNodesIcon: <NodesCategoryL1Icon Icon={PuzzlePieceIcon} className="h-5 w-5 text-primary" />,
  WrenchIcon: <NodesCategoryL1Icon Icon={WrenchIcon} className="h-5 w-5 text-primary" />,
  AutomationEssentialsIcon: (
    <NodesCategoryL1Icon Icon={FunctionIcon} className="h-5 w-5 text-primary" />
  ),
  UIAutomationAndUserActionsIcon: (
    <NodesCategoryL1Icon Icon={KeyboardIcon} className="h-5 w-5 text-primary" />
  ),
  IntelligentAutomationIcon: (
    <NodesCategoryL1Icon Icon={BrainIcon} className="h-5 w-5 text-primary" />
  ),
  BLockIcon: <NodesCategoryL1Icon Icon={IntersectSquareIcon} />,

  // Logical Nodes
  ConditionalNodeIcon: <ConditionalNodeIcon />,
  LoopNodeIcon: <LoopNodeIcon />,
  BreakLoopNodeIcon: <BreakLoopNodeIcon />,
  ContinueLoopNodeIcon: <ContinueLoopNodeIcon />,
  ExitFlowNodeIcon: <ExitFlowNodeIcon />,

  CallAgentIcon: <CallAgentIcon />,
  BlockNodeIcon: <BlockNodeIcon />,

  // Trigger Nodes
  ManualTriggerIcon: <TriggerNodeIcon Icon={CursorClickIcon} />,
  ScheduleTriggerIcon: <TriggerNodeIcon Icon={CalendarCheckIcon} />,
  IntervalTriggerIcon: <TriggerNodeIcon Icon={TimerIcon} />,
  FileSystemEventTrigger: <TriggerNodeIcon Icon={FileTextIcon} />,
  EmailTriggerIcon: <TriggerNodeIcon Icon={EnvelopeOpenIcon} />,
  DatabaseEventTriggerIcon: <TriggerNodeIcon Icon={DatabaseIcon} />,
  FormSubmissionTriggerIcon: <TriggerNodeIcon Icon={ListChecksIcon} />,
  SystemEventTriggerIcon: <TriggerNodeIcon Icon={MonitorIcon} />,
  ServiceEventTriggerIcon: <TriggerNodeIcon Icon={MonitorIcon} />,
  WebhookTriggerIcon: <TriggerNodeIcon Icon={WebhooksLogoIcon} />,
  HttpTriggerIcon: <TriggerNodeIcon Icon={GlobeIcon} />,
  ErrorDetectionTriggerIcon: <TriggerNodeIcon Icon={WarningCircleIcon} />,
  CustomTriggerIcon: <TriggerNodeIcon Icon={BracketsAngleIcon} />,
};

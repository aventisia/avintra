import { ConditionalNodeIcon, LoopNodeIcon } from "./LogicalNodeIcons";
import { TriggerNodeIcon } from "./TriggerNodeIcon";
import {
  CalendarCheck,
  CircleAlert,
  DatabaseZap,
  FileCheck,
  Globe,
  ListCheck,
  MailCheck,
  MonitorCheck,
  MonitorCog,
  MousePointerClick,
  TimerReset,
  Webhook,
  ChevronsLeftRightEllipsis,
} from "lucide-react";

export const nodesIconMapper: { [key: string]: JSX.Element } = {
  // Logical Nodes
  ConditionalNodeIcon: <ConditionalNodeIcon />,
  LoopNodeIcon: <LoopNodeIcon />,
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

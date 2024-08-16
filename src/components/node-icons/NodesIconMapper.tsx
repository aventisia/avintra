import { ConditionalNodeIcon, LoopNodeIcon } from "./LogicalNodeIcons";
import { ManualTriggerIcon } from "./TriggerNodeIcons";

export const nodesIconMapper: { [key: string]: JSX.Element } = {
  ConditionalNodeIcon: <ConditionalNodeIcon />,
  LoopNodeIcon: <LoopNodeIcon />,
  ManualTriggerIcon: <ManualTriggerIcon />,
};

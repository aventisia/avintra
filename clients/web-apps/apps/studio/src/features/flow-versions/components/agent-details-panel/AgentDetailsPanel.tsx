import { ScrollArea } from "@avplatform/ui/scroll";

import {
  Panel,
  PanelClose,
  PanelContent,
  PanelHeader,
  PanelTitle,
} from "@/components/panel/components/Panel";

import { AGENT_DETAILS_PANEL_ID } from "../../constants";
import { FlowVersionDto } from "../../dtos/flow-version-dto";
import { AgentActivity } from "./AgentActivity";
import { AgentFacts } from "./AgentFacts";
import { AgentIdentity } from "./AgentIdentity";
import { VersionTimeline } from "./VersionTimeline";

interface AgentDetailsPanelProps {
  /** Versions newest first, as the versions API returns them. */
  versions: FlowVersionDto[] | undefined;
  isLoading: boolean;
}

export const AgentDetailsPanel = ({ versions, isLoading }: AgentDetailsPanelProps) => (
  <Panel id={AGENT_DETAILS_PANEL_ID} side="left" width="w-[22rem]" className="left-2 rounded-xl">
    <PanelHeader className="h-11 pl-4 pr-1.5">
      <PanelTitle className="text-body-sm font-semibold">Agent details</PanelTitle>
      <PanelClose />
    </PanelHeader>
    <PanelContent>
      <ScrollArea className="h-[calc(100vh-7.75rem)]">
        <AgentIdentity />
        <AgentActivity />
        <AgentFacts versions={versions} />
        <VersionTimeline versions={versions} isLoading={isLoading} />
      </ScrollArea>
    </PanelContent>
  </Panel>
);

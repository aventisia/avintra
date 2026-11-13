import { ScrollArea } from "@avplatform/ui/scroll";

import { Panel, PanelContent, PanelTitle } from "@/components/panel/components/Panel";

import { AGENT_DETAILS_PANEL_ID } from "../../constants";
import { FlowVersionDto } from "../../dtos/flow-version-dto";
import { AgentActivity } from "./AgentActivity";
import { AgentDescription } from "./AgentDescription";
import { AgentFacts } from "./AgentFacts";
import { VersionTimeline } from "./VersionTimeline";

interface AgentDetailsPanelProps {
  /** Versions newest first, as the versions API returns them. */
  versions: FlowVersionDto[] | undefined;
  isLoading: boolean;
}

/**
 * Agent details below the header trigger: a tinted band with the description and run activity,
 * the version rail, and a pinned footer with access and the agent ID.
 */
export const AgentDetailsPanel = ({ versions, isLoading }: AgentDetailsPanelProps) => (
  <Panel
    id={AGENT_DETAILS_PANEL_ID}
    side="left"
    width="w-[25rem]"
    className="left-0 top-[var(--header-height)] h-[calc(100vh-var(--header-height))] rounded-none duration-200 animate-in fade-in-0 slide-in-from-top-1 motion-reduce:animate-none"
  >
    <PanelTitle className="sr-only">Agent details</PanelTitle>
    <PanelContent className="flex h-full flex-col">
      <ScrollArea className="min-h-0 flex-1">
        <div className="border-b border-line bg-gradient-to-b from-surface to-sunken/70">
          <AgentDescription />
          <AgentActivity />
        </div>
        <VersionTimeline versions={versions} isLoading={isLoading} />
      </ScrollArea>
      <AgentFacts />
    </PanelContent>
  </Panel>
);

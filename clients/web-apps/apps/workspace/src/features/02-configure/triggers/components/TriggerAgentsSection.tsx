import { cn } from "@avplatform/ui/lib";
import {
  RecordEmpty,
  RecordList,
  RecordListItem,
  RecordSection,
} from "@avplatform/ui/record-sheet";

import { AgentAvatar } from "@/components/AgentAvatar";
import { AGENT_NAME_LINK_CLASS, AgentTypeAvatar, AgentVersion } from "@/components/AgentIdentity";

type TriggerAgent = {
  id: string;
  flowId: string;
  name: string;
  versionNumber?: number;
  lastModifiedOn?: Date | string | null;
};

type TriggerAgentsSectionProps = {
  agents: TriggerAgent[];
  isError: boolean;
  title?: string;
  emptyMessage?: string;
};

/**
 * Agents a trigger runs, each linking to its version in Agent Builder.
 */
export const TriggerAgentsSection = ({
  agents,
  isError,
  title = "Agents",
  emptyMessage = "No agents run when this trigger fires",
}: TriggerAgentsSectionProps) => {
  if (isError) {
    return (
      <RecordSection title={title}>
        <RecordEmpty>Could not load the agents for this trigger</RecordEmpty>
      </RecordSection>
    );
  }

  return (
    <RecordSection title={title} count={agents.length}>
      {agents.length > 0 ? (
        <RecordList>
          {agents.map((agent) => (
            <RecordListItem
              key={agent.id}
              className="text-body-sm transition-colors duration-[120ms] ease-out hover:bg-hover"
            >
              <AgentTypeAvatar />
              <div className="flex min-w-0 flex-1 items-center gap-2.5">
                <a
                  href={`${import.meta.env.VITE_STUDIO_PATH}agent?f=${agent.flowId}&v=${agent.id}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  draggable={false}
                  title={`View ${agent.name} v${agent.versionNumber} in Agent Builder`}
                  className={cn(AGENT_NAME_LINK_CLASS, "text-ink")}
                >
                  {agent.name}
                </a>
                <AgentVersion
                  versionNumber={agent.versionNumber}
                  lastModifiedOn={agent.lastModifiedOn ?? undefined}
                />
              </div>
            </RecordListItem>
          ))}
        </RecordList>
      ) : (
        <RecordEmpty mark={<AgentAvatar size="md" />}>{emptyMessage}</RecordEmpty>
      )}
    </RecordSection>
  );
};

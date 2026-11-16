import { Badge } from "@avplatform/ui/badge";
import { cn } from "@avplatform/ui/lib";
import { CpuIcon, ListChecksIcon } from "@phosphor-icons/react";
import { Fragment } from "react";
import { NavLink } from "react-router-dom";

import { AgentAvatar } from "@/components/AgentAvatar";
import {
  AGENT_PLATFORMS,
  AGENT_TYPES,
} from "@/features/01-build/flows-table/constants/agent-attributes.constant";
import { getAgentPlatform } from "@/features/01-build/flows-table/utils/agent-attributes.util";

import { AgentsAssistDto } from "../dtos/agent-assist-dto";
import { getAgentStatusLabel, isAgentRunning } from "../utils/agent-status.util";
import { getAgentTypeLabel } from "../utils/agent-type-label.util";
import { AgentsListItemActions } from "./assign-agent-item-actions";
import { ExecutionAction } from "./assign-agent-item-actions/ExecutionAction";

type AgentCardProps = {
  agent: AgentsAssistDto;
};

const META_CLASS_NAME = "inline-flex min-w-0 items-center gap-1 text-xs text-muted-foreground";

const getQueueUrl = (queueId: string, queueName: string, queueType?: string) =>
  `/assist/queues?qid=${queueId}&qn=${encodeURIComponent(queueName)}&qt=${queueType ?? "User"}`;

/**
 * Card of an agent assigned to the user's machines, laid out like the Agents grid card: the
 * type-tinted glyph, name, type, version and live status, description, and a footer with AI
 * model, platform and queues, plus the execute and remove actions.
 */
export const AgentCard = ({ agent }: AgentCardProps) => {
  const agentType = AGENT_TYPES.find((option) => option.value === agent.type);
  const platform = AGENT_PLATFORMS.find((option) => option.value === getAgentPlatform(agent));
  const [firstModel, ...otherModels] = agent.aiModels ?? [];
  const [firstQueue, ...otherQueues] = agent.queues ?? [];

  const footerMeta = [
    firstModel && (
      <span
        key="model"
        className={cn(META_CLASS_NAME, "max-w-[60%] shrink-0")}
        title={agent.aiModels?.join(", ")}
      >
        <CpuIcon className="size-3.5 shrink-0" />
        <span className="truncate">{firstModel}</span>
        {otherModels.length > 0 && <span className="shrink-0">+{otherModels.length}</span>}
      </span>
    ),
    platform && (
      <span key="platform" className={META_CLASS_NAME} title={platform.label}>
        <platform.icon className="size-3.5 shrink-0" />
        <span className="truncate">{platform.label}</span>
      </span>
    ),
  ].filter(Boolean);

  return (
    <div className="group relative flex flex-col rounded-md border border-line bg-surface transition-colors duration-150 hover:border-line-strong">
      <div className="flex items-start gap-3 p-4 pb-0">
        <AgentAvatar size="lg" Icon={agentType?.icon} className={agentType?.tint} />
        <div className="flex min-w-0 flex-1 flex-col gap-0.5">
          <span title={agent.name} className="min-w-0 truncate text-body font-semibold text-ink">
            {agent.name}
          </span>
          <span className="flex items-center gap-1.5 whitespace-nowrap text-xs text-muted-foreground">
            {agentType?.label ?? getAgentTypeLabel(agent.type)}
            <span className="font-mono tabular-nums">v{agent.versionNumber}</span>
          </span>
        </div>
        <div className="-mr-1.5 -mt-1 flex shrink-0 items-center gap-0.5">
          <Badge variant={isAgentRunning(agent) ? "running" : "queued"} className="mr-1">
            {getAgentStatusLabel(agent)}
          </Badge>
          <ExecutionAction
            executionState={agent.status}
            rowId={agent.id}
            flowName={agent.name}
            flowVersionNumber={agent.versionNumber}
            supportedPlatform={agent.supportedPlatform}
            jobId={agent.jobId}
          />
          <AgentsListItemActions id={agent.id || ""} machineIds={agent.assignedMachineIds} />
        </div>
      </div>

      <div className="mx-4 mb-4 mt-3">
        <p className="line-clamp-2 min-h-10 text-body-sm text-ink-2" title={agent.description}>
          {agent.description || <span className="text-muted-foreground">No description</span>}
        </p>
      </div>

      <div className="mt-auto flex h-10 items-center gap-1.5 overflow-hidden border-t border-line px-4">
        {footerMeta.map((meta, index) => (
          <Fragment key={index}>
            {index > 0 && (
              <span aria-hidden className="size-[3px] shrink-0 rounded-full bg-muted-foreground" />
            )}
            {meta}
          </Fragment>
        ))}
        {firstQueue && (
          <NavLink
            to={getQueueUrl(firstQueue.id, firstQueue.name, firstQueue.type)}
            title={agent.queues?.map((queue) => queue.name).join(", ")}
            className={cn(
              META_CLASS_NAME,
              "ml-auto rounded-sm pl-1.5 outline-none hover:text-ink focus-visible:ring-2 focus-visible:ring-focus",
            )}
          >
            <ListChecksIcon className="size-3.5 shrink-0" />
            <span className="truncate">{firstQueue.name}</span>
            {otherQueues.length > 0 && <span className="shrink-0">+{otherQueues.length}</span>}
          </NavLink>
        )}
      </div>
    </div>
  );
};

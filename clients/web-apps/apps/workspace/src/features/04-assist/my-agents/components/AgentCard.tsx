import { Badge } from "@avplatform/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@avplatform/ui/cards";
import { CpuIcon, ListChecksIcon, TagIcon } from "@phosphor-icons/react";
import { NavLink } from "react-router-dom";

import NewAgentIcon from "@/components/NewAgentIcon";

import { AgentsAssistDto } from "../dtos/agent-assist-dto";
import { getAgentTypeLabel } from "../utils/agent-type-label.util";
import { AgentsListItemActions } from "./assign-agent-item-actions";
import { ExecutionAction } from "./assign-agent-item-actions/ExecutionAction";

type AgentCardProps = {
  agent: AgentsAssistDto;
};

/**
 * AgentCard
 *
 * Card representation of a published agent assigned to the current user's
 * machines. Shows the agent name, its type, version and AI models as badges, the
 * queues it is linked to, a live status indicator, and the execute/remove actions.
 */
export const AgentCard = ({ agent }: AgentCardProps) => {
  const queues = agent.queues ?? [];
  const aiModels = agent.aiModels ?? [];

  // Cap the badges/chips so every card keeps the same fixed height.
  const visibleModels = aiModels.slice(0, 1);
  const hiddenModelCount = aiModels.length - visibleModels.length;
  const visibleQueues = queues.slice(0, 1);
  const hiddenQueueCount = queues.length - visibleQueues.length;

  // Live execution state of the machine hosting the agent.
  const isRunning = agent.status?.toLowerCase() === "running";
  const statusLabel = agent.status
    ? agent.status.charAt(0).toUpperCase() + agent.status.slice(1)
    : "Offline";

  // Build the work-items URL for a linked queue, preserving the queue type so the
  // correct queue list is loaded on the Assist > Queues screen.
  const getQueueUrl = (queueId: string, queueName: string, queueType?: string) =>
    `/assist/queues?qid=${queueId}&qn=${encodeURIComponent(queueName)}&qt=${queueType ?? "User"}`;

  return (
    <Card className="group relative flex h-[13rem] flex-col overflow-hidden rounded-lg border border-line bg-surface transition-all duration-200 hover:-translate-y-0.5 hover:border-line-strong">
      <CardHeader className="flex flex-row items-center justify-between gap-2 space-y-0 px-3.5 pb-2 pt-2.5">
        {/* Agent icon tile */}
        <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-md bg-sunken text-ink-2 ring-1 ring-line transition-transform duration-200 group-hover:scale-105">
          <NewAgentIcon className="h-4 w-4" />
        </div>
        {/* Live status indicator */}
        <Badge variant={isRunning ? "running" : "queued"}>{statusLabel}</Badge>
      </CardHeader>

      <CardContent className="flex-1 space-y-2.5 overflow-hidden px-3.5 pb-1.5 pt-2">
        {/* Agent name with its version inline */}
        <div className="flex items-center gap-1.5">
          <CardTitle
            title={agent.name}
            className="min-w-0 flex-1 truncate text-base font-bold capitalize tracking-tight text-ink transition-colors group-hover:text-primary-text"
          >
            {agent.name}
          </CardTitle>
          <Badge variant="outline" className="shrink-0 tabular-nums">
            v{agent.versionNumber}
          </Badge>
        </div>

        {/* Agent description */}
        {agent.description && (
          <p className="line-clamp-2 text-2xs leading-snug text-muted-foreground">
            {agent.description}
          </p>
        )}

        {/* Type and AI model badges */}
        <div className="flex flex-nowrap items-center gap-1.5 overflow-hidden">
          <Badge variant="outline" className="shrink-0 gap-1">
            <TagIcon className="h-3 w-3" />
            <span className="leading-3">{getAgentTypeLabel(agent.type)}</span>
          </Badge>
          {visibleModels.map((model) => (
            <Badge key={model} variant="outline" className="min-w-0 gap-1">
              <CpuIcon className="h-3 w-3 shrink-0" />
              <span className="truncate leading-3">{model}</span>
            </Badge>
          ))}
          {hiddenModelCount > 0 && (
            <Badge variant="outline" className="shrink-0 tabular-nums">
              +{hiddenModelCount}
            </Badge>
          )}
        </div>
      </CardContent>

      {/* Queues (left) and actions (right) share a single line */}
      <div className="flex items-center justify-between gap-2 px-3.5 pb-2 pt-1">
        <div className="flex min-w-0 flex-1 items-center gap-1.5 overflow-hidden">
          <span className="inline-flex shrink-0 items-center gap-1 text-3xs font-semibold uppercase tracking-wide text-muted-foreground">
            <ListChecksIcon className="h-3.5 w-3.5 text-primary" />
            Queues
          </span>
          {queues.length > 0 ? (
            <>
              {visibleQueues.map((queue) => (
                <NavLink
                  key={queue.id}
                  to={getQueueUrl(queue.id, queue.name, queue.type)}
                  title={queue.name}
                  className="inline-flex max-w-32 items-center rounded-sm border border-line bg-surface px-2 py-0.5 text-2xs font-medium text-ink-2 transition-colors hover:border-line-strong hover:bg-hover hover:text-ink"
                >
                  <span className="truncate">{queue.name}</span>
                </NavLink>
              ))}
              {hiddenQueueCount > 0 && (
                <span
                  className="inline-flex items-center rounded-sm border border-line bg-sunken px-2 py-0.5 font-mono text-2xs font-medium tabular-nums text-muted-foreground"
                  title={`${hiddenQueueCount} more queue(s)`}
                >
                  +{hiddenQueueCount}
                </span>
              )}
            </>
          ) : (
            <span className="text-2xs font-medium text-muted-foreground">None</span>
          )}
        </div>
        <div className="flex shrink-0 items-center gap-0.5">
          {/* Execute / abort action */}
          <ExecutionAction
            executionState={agent.status}
            rowId={agent.id}
            flowName={agent.name}
            flowVersionNumber={agent.versionNumber}
            supportedPlatform={agent.supportedPlatform}
            jobId={agent.jobId}
          />
          {/* Actions menu (remove from machines) */}
          <AgentsListItemActions id={agent.id || ""} machineIds={agent.assignedMachineIds} />
        </div>
      </div>
    </Card>
  );
};

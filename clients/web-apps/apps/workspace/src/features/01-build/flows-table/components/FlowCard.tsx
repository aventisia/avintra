import { Badge } from "@avplatform/ui/badge";
import { Card, CardContent, CardHeader } from "@avplatform/ui/cards";
import { Archive, Cpu, ListChecks, Monitor, Tag } from "lucide-react";
import { NavLink } from "react-router-dom";

import { HighlightedText } from "@/components/HighlightedText";
import NewAgentIcon from "@/components/NewAgentIcon";

import { FlowsTableDto } from "../dtos/flows-table-dto";
import { FoldersTableRowDto } from "../dtos/folders-table-row.dto";
import { getAgentDragProps } from "../utils/agent-drag.util";
import { getFlowTypeLabel } from "../utils/flow-type-label.util";
import { FolderChip } from "./FolderChip";
import { FlowRowActions } from "./flow-row-actions/FlowRowActions";

type FlowCardProps = {
  flow: FlowsTableDto;
  searchText: string;
  folder?: FoldersTableRowDto;
};

/**
 * FlowCard
 *
 * Card representation of a flow (agent) for the Agents grid view. Shows the icon,
 * name (opening the Agent Builder), type, platform and AI model badges, the queues
 * the agent is linked to, and the same row actions available in the table view.
 */
export const FlowCard = ({ flow, searchText, folder }: FlowCardProps) => {
  // Flows run on Windows only when the supported platform is restricted.
  const platform = flow.supportedPlatform === "windows" ? "Windows" : "Cloud & Windows";
  const aiModels = flow.aiModels ?? [];
  const queues = flow.queues ?? [];

  // Cap the badges/chips so every card keeps the same fixed height.
  const visibleModels = aiModels.slice(0, 1);
  const hiddenModelCount = aiModels.length - visibleModels.length;
  const visibleQueues = queues.slice(0, 1);
  const hiddenQueueCount = queues.length - visibleQueues.length;

  // Build the work-items URL for a linked queue, preserving the queue type.
  const getQueueUrl = (queueId: string, queueName: string, queueType?: string) =>
    `/assist/queues?qid=${queueId}&qn=${encodeURIComponent(queueName)}&qt=${queueType ?? "User"}`;

  // Link that opens the agent in the Agent Builder (studio). The studio is served
  // from `/studio/`, a separate app origin, so it must be treated as external.
  const studioHref = `${import.meta.env.VITE_STUDIO_PATH}agent?f=${flow.id}`;
  const isExternalStudio = /^https?:\/\//i.test(studioHref) || studioHref.startsWith("/studio/");

  const agentName = <HighlightedText text={flow.name ?? "NAME_NOT_FOUND"} query={searchText} />;

  const nameClassName =
    "min-w-0 flex-1 truncate text-base font-semibold capitalize tracking-tight text-ink transition-colors hover:text-primary";

  return (
    <Card
      {...getAgentDragProps(flow)}
      className="group relative flex h-[13rem] flex-col overflow-hidden rounded-lg border border-line bg-surface transition-colors duration-200 hover:border-line-strong"
    >
      <CardHeader className="flex flex-row items-center justify-between gap-2 space-y-0 px-3.5 pb-2 pt-2.5">
        {/* Agent icon tile */}
        <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-md bg-sunken text-ink-2 ring-1 ring-line transition-transform duration-200 group-hover:scale-105">
          <NewAgentIcon className="h-4 w-4" />
        </div>
        {/* Supported platform and (shared) access level */}
        <div className="flex min-w-0 items-center gap-1">
          {folder && <FolderChip folder={folder} />}
          <span className="inline-flex items-center gap-1 rounded-sm border border-line bg-sunken px-1.5 py-0.5 text-2xs font-medium text-ink-2">
            <Monitor className="h-3 w-3" />
            {platform}
          </span>
          <Badge
            variant="outline"
            className="whitespace-nowrap rounded-sm border-line bg-muted px-2 py-0.5 text-primary"
          >
            {flow.accessLevel?.replace(/([A-Z])/g, " $1").trim()}
          </Badge>
        </div>
      </CardHeader>

      <CardContent className="flex-1 space-y-2.5 overflow-hidden px-3.5 pb-1.5 pt-2">
        {/* Prominent name with its version inline; opens the agent in the Agent Builder */}
        <div className="flex items-center gap-1.5">
          {isExternalStudio ? (
            <a
              href={studioHref}
              draggable={false}
              title={`Open ${flow.name} v${flow.versionNumber} in Agent Builder`}
              className={nameClassName}
            >
              {agentName}
            </a>
          ) : (
            <NavLink
              to={studioHref}
              draggable={false}
              title={`Open ${flow.name} v${flow.versionNumber} in Agent Builder`}
              className={nameClassName}
            >
              {agentName}
            </NavLink>
          )}
          <Badge
            variant="outline"
            className="shrink-0 whitespace-nowrap rounded-sm border-line bg-sunken py-0.5 font-mono font-medium text-ink-2"
          >
            v{flow.versionNumber}
          </Badge>
          {flow.isArchived && (
            <Badge
              variant="outline"
              className="shrink-0 gap-1 whitespace-nowrap rounded-sm border-line bg-sunken py-0.5 font-medium text-ink-2"
            >
              <Archive className="h-3 w-3" />
              Archived
            </Badge>
          )}
        </div>

        {/* Agent description */}
        {flow.description && (
          <p className="line-clamp-2 text-2xs leading-snug text-muted-foreground">
            {flow.description}
          </p>
        )}

        {/* Type, AI model and (shared) access level badges */}
        <div className="flex flex-nowrap items-center gap-1.5 overflow-hidden">
          <Badge
            variant="outline"
            className="shrink-0 gap-1 rounded-sm border-line bg-selected py-0.5 text-primary-text"
          >
            <Tag className="h-3 w-3" />
            <span className="leading-3">{getFlowTypeLabel(String(flow.type))}</span>
          </Badge>
          {visibleModels.map((model) => (
            <Badge
              key={model}
              variant="outline"
              className="min-w-0 gap-1 rounded-sm border-line bg-sunken py-0.5 text-ink-2"
            >
              <Cpu className="h-3 w-3 shrink-0" />
              <span className="truncate leading-3">{model}</span>
            </Badge>
          ))}
          {hiddenModelCount > 0 && (
            <Badge
              variant="outline"
              className="shrink-0 rounded-sm border-line bg-sunken py-0.5 font-mono font-medium text-ink-2"
            >
              +{hiddenModelCount}
            </Badge>
          )}
        </div>
      </CardContent>

      {/* Queues (left) and actions (right) share a single line */}
      <div className="flex items-center justify-between gap-2 px-3.5 pb-2 pt-1">
        <div className="flex min-w-0 flex-1 items-center gap-1.5 overflow-hidden">
          <span className="inline-flex shrink-0 items-center gap-1 text-3xs font-semibold uppercase tracking-wide text-muted-foreground">
            <ListChecks className="h-3.5 w-3.5 text-primary" />
            Queues
          </span>
          {queues.length > 0 ? (
            <>
              {visibleQueues.map((queue) => (
                <NavLink
                  key={queue.id}
                  to={getQueueUrl(queue.id, queue.name, queue.type)}
                  draggable={false}
                  title={queue.name}
                  className="inline-flex max-w-32 items-center rounded-sm border border-line bg-surface px-2 py-0.5 text-2xs font-medium text-ink-2 transition-colors hover:border-line-strong hover:bg-hover hover:text-ink"
                >
                  <span className="truncate">{queue.name}</span>
                </NavLink>
              ))}
              {hiddenQueueCount > 0 && (
                <span
                  className="inline-flex items-center rounded-sm border border-line bg-sunken px-2 py-0.5 text-2xs font-medium text-muted-foreground"
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
        <div className="flex shrink-0 items-center">
          {/* Same actions as the table row */}
          <FlowRowActions
            rowId={flow.id || "rowId"}
            name={flow.name}
            accessLevel={flow.accessLevel}
            isTenantWideAccess={flow.isTenantWideAccess || false}
            folderId={flow.folderId}
            isArchived={flow.isArchived || false}
            isPublished={flow.isPublished || false}
          />
        </div>
      </div>
    </Card>
  );
};

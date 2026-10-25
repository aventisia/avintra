import { cn } from "@avplatform/ui/lib";
import { formatDate } from "@avplatform/ui/utils";
import { formatDistanceToNow } from "date-fns";
import { ListChecks } from "lucide-react";
import { NavLink } from "react-router-dom";

import { AgentAvatar } from "@/components/AgentAvatar";
import { HighlightedText } from "@/components/HighlightedText";
import { PersonAvatar } from "@/components/PersonAvatar";
import { pluralize } from "@/utils/pluralize.util";

import {
  ACCESS_LEVELS,
  AGENT_PLATFORMS,
  AGENT_TYPES,
} from "../../constants/agent-attributes.constant";
import { FlowsTableDto } from "../../dtos/flows-table-dto";
import { FoldersTableRowDto } from "../../dtos/folders-table-row.dto";
import { AgentPlatform } from "../../types/agent-platform.type";
import { getAccessLevelLabel, getAgentBuilderLink } from "../../utils/agent-attributes.util";
import { getFlowTypeLabel } from "../../utils/flow-type-label.util";
import { FolderChip } from "../FolderChip";

const EMPTY_VALUE = <span className="text-slate-300">-</span>;

type AgentNameCellProps = {
  flow: FlowsTableDto;
  searchText: string;
  folder?: FoldersTableRowDto;
};

const MetaSeparator = () => (
  <span aria-hidden="true" className="text-base leading-none text-slate-300">
    ·
  </span>
);

/**
 * Agent avatar and two lines: the name (opens the Agent Builder) with its folder chip,
 * then the latest version, its Published badge, last update, and queues.
 */
export const AgentNameCell = ({ flow, searchText, folder }: AgentNameCellProps) => {
  const { href, isExternal } = getAgentBuilderLink(flow.id);
  const linkProps = {
    draggable: false,
    title: `Open ${flow.name} v${flow.versionNumber} in Agent Builder`,
    className: cn(
      "min-w-0 truncate rounded-sm text-sm font-semibold outline-none transition-colors hover:text-indigo-600 focus-visible:ring-2 focus-visible:ring-indigo-500/50",
      flow.isArchived ? "text-slate-500" : "text-slate-900",
    ),
  };
  const name = (
    <>
      <HighlightedText text={flow.name ?? "NAME_NOT_FOUND"} query={searchText} />
      {flow.isArchived && <span className="sr-only"> (archived)</span>}
    </>
  );
  const queueCount = flow.queues?.length ?? 0;

  return (
    <div className="flex min-w-0 max-w-[32rem] items-center gap-3 py-2">
      <AgentAvatar size="xl" className={cn(flow.isArchived && "opacity-50 grayscale")} />
      <div className="min-w-0 flex-1 space-y-0.5">
        <div className="flex min-w-0 items-center gap-2">
          {isExternal ? (
            <a href={href} {...linkProps}>
              {name}
            </a>
          ) : (
            <NavLink to={href} {...linkProps}>
              {name}
            </NavLink>
          )}
          {folder && <FolderChip folder={folder} />}
        </div>
        <div className="flex min-w-0 items-center gap-1.5 whitespace-nowrap text-xs text-slate-500">
          <span className="shrink-0 tabular-nums">v{flow.versionNumber}</span>
          {!flow.isArchived && flow.isPublished && (
            <>
              <MetaSeparator />
              <span className="inline-flex items-center gap-1.5">
                <span className="size-1.5 rounded-full bg-emerald-500 ring-2 ring-emerald-100" />
                Published
              </span>
            </>
          )}
          {flow.lastModifiedOn && (
            <>
              <MetaSeparator />
              <span title={`Updated ${formatDate(flow.lastModifiedOn, true)}`}>
                {formatDistanceToNow(flow.lastModifiedOn, { addSuffix: true })}
              </span>
            </>
          )}
          {queueCount > 0 && (
            <>
              <MetaSeparator />
              <span
                className="inline-flex items-center gap-1"
                title={flow.queues?.map((queue) => queue.name).join(", ")}
              >
                <ListChecks className="size-3 text-slate-400" />
                {queueCount} {pluralize(queueCount, "queue")}
              </span>
            </>
          )}
        </div>
      </div>
    </div>
  );
};

/**
 * Agent type with its tinted icon.
 */
export const AgentTypeCell = ({ type }: { type: string }) => {
  const agentType = AGENT_TYPES.find((option) => option.value === type);
  if (!agentType) return <span>{getFlowTypeLabel(type)}</span>;

  return (
    <span className="inline-flex items-center gap-2">
      <span
        className={cn(
          "grid size-5 shrink-0 place-items-center rounded-md ring-1 ring-inset",
          agentType.tint,
        )}
      >
        <agentType.icon className="size-3" />
      </span>
      {agentType.label}
    </span>
  );
};

/**
 * Where the agent runs, with its icon.
 */
export const AgentPlatformCell = ({ platform }: { platform: AgentPlatform }) => {
  const agentPlatform = AGENT_PLATFORMS.find((option) => option.value === platform);
  if (!agentPlatform) return EMPTY_VALUE;

  return (
    <span className="inline-flex items-center gap-1.5 text-slate-600">
      <agentPlatform.icon className="size-3.5 text-slate-400" />
      {agentPlatform.label}
    </span>
  );
};

type AccessLevelCellProps = {
  accessLevel?: string;
};

/**
 * The user's access level on the agent as a pill with a colored dot.
 */
export const AccessLevelCell = ({ accessLevel }: AccessLevelCellProps) => {
  if (!accessLevel) return EMPTY_VALUE;
  const dotClassName = ACCESS_LEVELS[accessLevel as keyof typeof ACCESS_LEVELS]?.dot;

  return (
    <span className="inline-flex items-center gap-1.5 rounded-full bg-background py-0.5 pl-2 pr-2.5 text-xs font-medium text-slate-700 ring-1 ring-inset ring-slate-200">
      <span className={cn("size-1.5 rounded-full bg-slate-400", dotClassName)} />
      {getAccessLevelLabel(accessLevel)}
    </span>
  );
};

/**
 * Initials avatar and name of the user who created the agent.
 */
export const CreatorCell = ({ name }: { name?: string }) => {
  if (!name) return EMPTY_VALUE;

  return (
    <span className="inline-flex min-w-0 items-center gap-2">
      <PersonAvatar name={name} />
      <span className="max-w-[12rem] truncate text-slate-700">{name}</span>
    </span>
  );
};

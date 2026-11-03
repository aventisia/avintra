import { HighlightedText } from "@avplatform/ui/highlighted-text";
import { cn } from "@avplatform/ui/lib";
import { formatDate } from "@avplatform/ui/utils";
import { ListChecksIcon } from "@phosphor-icons/react";
import { formatDistanceToNow } from "date-fns";
import { NavLink } from "react-router-dom";

import { AgentAvatar } from "@/components/AgentAvatar";
import { PersonAvatar } from "@/components/PersonAvatar";
import { pluralize } from "@/utils/pluralize.util";

import { AGENT_PLATFORMS, AGENT_TYPES } from "../../constants/agent-attributes.constant";
import { FlowsTableDto } from "../../dtos/flows-table-dto";
import { FoldersTableRowDto } from "../../dtos/folders-table-row.dto";
import { AgentPlatform } from "../../types/agent-platform.type";
import { getAccessLevelLabel, getAgentBuilderLink } from "../../utils/agent-attributes.util";
import { getFlowTypeLabel } from "../../utils/flow-type-label.util";
import { FolderChip } from "../FolderChip";

const EMPTY_VALUE = <span className="text-muted-foreground">-</span>;

type AgentNameCellProps = {
  flow: FlowsTableDto;
  searchText: string;
  folder?: FoldersTableRowDto;
};

/**
 * Agent glyph and one line: the name (opens the Agent Builder), latest version, Published dot,
 * queue count, and folder chip.
 */
export const AgentNameCell = ({ flow, searchText, folder }: AgentNameCellProps) => {
  const { href, isExternal } = getAgentBuilderLink(flow.id);
  const linkProps = {
    draggable: false,
    title: `Open ${flow.name} v${flow.versionNumber} in Agent Builder`,
    className: cn(
      "min-w-0 truncate rounded-sm font-semibold outline-none transition-colors hover:text-primary-text focus-visible:ring-2 focus-visible:ring-focus",
      flow.isArchived ? "text-muted-foreground" : "text-ink",
    ),
  };
  const name = (
    <>
      <HighlightedText text={flow.name ?? "NAME_NOT_FOUND"} query={searchText} />
      {flow.isArchived && <span className="sr-only"> (archived)</span>}
    </>
  );
  const queueCount = flow.queues?.length ?? 0;
  const agentType = AGENT_TYPES.find((option) => option.value === flow.type);

  return (
    <div className="flex min-w-0 max-w-[32rem] items-center gap-2.5 whitespace-nowrap">
      <AgentAvatar
        size="sm"
        Icon={agentType?.icon}
        className={cn(
          "size-[30px] rounded-md",
          agentType?.tint,
          flow.isArchived && "opacity-50 grayscale",
        )}
      />
      {isExternal ? (
        <a href={href} {...linkProps}>
          {name}
        </a>
      ) : (
        <NavLink to={href} {...linkProps}>
          {name}
        </NavLink>
      )}
      <span
        className="shrink-0 font-mono text-[11.5px] tabular-nums text-muted-foreground"
        title={
          flow.lastModifiedOn
            ? `Updated ${formatDistanceToNow(flow.lastModifiedOn, { addSuffix: true })} (${formatDate(flow.lastModifiedOn, true)})`
            : undefined
        }
      >
        v{flow.versionNumber}
      </span>
      {!flow.isArchived && flow.isPublished && (
        <span className="inline-flex shrink-0 items-center gap-1.5 text-xs text-muted-foreground">
          <span className="size-1.5 rounded-full bg-ok" />
          Published
        </span>
      )}
      {queueCount > 0 && (
        <span
          className="inline-flex shrink-0 items-center gap-1 text-xs text-muted-foreground"
          title={flow.queues?.map((queue) => queue.name).join(", ")}
        >
          <ListChecksIcon className="size-3" />
          {queueCount} {pluralize(queueCount, "queue")}
        </span>
      )}
      {folder && <FolderChip folder={folder} />}
    </div>
  );
};

/**
 * Agent type label.
 */
export const AgentTypeCell = ({ type }: { type: string }) => (
  <span className="text-ink-2">
    {AGENT_TYPES.find((option) => option.value === type)?.label ?? getFlowTypeLabel(type)}
  </span>
);

/**
 * Where the agent runs, with its icon.
 */
export const AgentPlatformCell = ({ platform }: { platform: AgentPlatform }) => {
  const agentPlatform = AGENT_PLATFORMS.find((option) => option.value === platform);
  if (!agentPlatform) return EMPTY_VALUE;

  return (
    <span className="inline-flex items-center gap-1.5 text-ink-2">
      <agentPlatform.icon className="size-3.5 text-muted-foreground" />
      {agentPlatform.label}
    </span>
  );
};

type AccessLevelCellProps = {
  accessLevel?: string;
};

/**
 * The user's access level on the agent.
 */
export const AccessLevelCell = ({ accessLevel }: AccessLevelCellProps) =>
  accessLevel ? (
    <span className="text-ink-2">{getAccessLevelLabel(accessLevel)}</span>
  ) : (
    EMPTY_VALUE
  );

/**
 * Initials avatar and name of the user who created the agent.
 */
export const CreatorCell = ({ name }: { name?: string }) => {
  if (!name) return EMPTY_VALUE;

  return (
    <span className="inline-flex min-w-0 items-center gap-2">
      <PersonAvatar name={name} />
      <span className="max-w-[12rem] truncate text-ink-2">{name}</span>
    </span>
  );
};

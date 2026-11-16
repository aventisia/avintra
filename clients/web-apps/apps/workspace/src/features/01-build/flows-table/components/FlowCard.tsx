import { HighlightedText } from "@avplatform/ui/highlighted-text";
import { cn } from "@avplatform/ui/lib";
import { ArchiveIcon, CpuIcon, ListChecksIcon } from "@phosphor-icons/react";
import { Fragment } from "react";
import { NavLink } from "react-router-dom";

import { AgentAvatar } from "@/components/AgentAvatar";
import { AgentPublishedMark } from "@/components/AgentIdentity";

import { AGENT_PLATFORMS, AGENT_TYPES } from "../constants/agent-attributes.constant";
import { FlowsTableDto } from "../dtos/flows-table-dto";
import { FoldersTableRowDto } from "../dtos/folders-table-row.dto";
import {
  getAccessLevelLabel,
  getAgentBuilderLink,
  getAgentPlatform,
} from "../utils/agent-attributes.util";
import { getAgentDragProps } from "../utils/agent-drag.util";
import { getFlowTypeLabel } from "../utils/flow-type-label.util";
import { FolderChip } from "./FolderChip";
import { FlowRowActions } from "./flow-row-actions/FlowRowActions";

type FlowCardProps = {
  flow: FlowsTableDto;
  searchText: string;
  folder?: FoldersTableRowDto;
};

const META_CLASS_NAME = "inline-flex min-w-0 items-center gap-1 text-xs text-muted-foreground";

const getQueueUrl = (queueId: string, queueName: string, queueType?: string) =>
  `/assist/queues?qid=${queueId}&qn=${encodeURIComponent(queueName)}&qt=${queueType ?? "User"}`;

/**
 * Agent card of the Agents grid view: the type-tinted glyph, name (opens the Agent Builder),
 * type, version, description, and a footer with AI model, access level, platform, folder and
 * queues, plus the same actions as the table row.
 */
export const FlowCard = ({ flow, searchText, folder }: FlowCardProps) => {
  const agentType = AGENT_TYPES.find((option) => option.value === flow.type);
  const platform = AGENT_PLATFORMS.find((option) => option.value === getAgentPlatform(flow));
  const { href, isExternal } = getAgentBuilderLink(flow.id);
  const [firstModel, ...otherModels] = flow.aiModels ?? [];
  const [firstQueue, ...otherQueues] = flow.queues ?? [];

  const linkProps = {
    draggable: false,
    title: `Open ${flow.name} v${flow.versionNumber} in Agent Builder`,
    className: cn(
      "min-w-0 truncate rounded-sm text-body font-semibold outline-none transition-colors hover:text-primary-text focus-visible:ring-2 focus-visible:ring-focus",
      flow.isArchived ? "text-muted-foreground" : "text-ink",
    ),
  };
  const name = <HighlightedText text={flow.name ?? "NAME_NOT_FOUND"} query={searchText} />;

  const footerMeta = [
    firstModel && (
      <span
        key="model"
        className={cn(META_CLASS_NAME, "max-w-[60%] shrink-0")}
        title={flow.aiModels?.join(", ")}
      >
        <CpuIcon className="size-3.5 shrink-0" />
        <span className="truncate">{firstModel}</span>
        {otherModels.length > 0 && <span className="shrink-0">+{otherModels.length}</span>}
      </span>
    ),
    flow.accessLevel && (
      <span key="access" className={cn(META_CLASS_NAME, "shrink-0")}>
        {getAccessLevelLabel(flow.accessLevel)}
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
    <div
      {...getAgentDragProps(flow)}
      className="group relative flex flex-col rounded-md border border-line bg-surface transition-colors duration-150 hover:border-line-strong"
    >
      <div className="flex items-start gap-3 p-4 pb-0">
        <AgentAvatar
          size="lg"
          Icon={agentType?.icon}
          className={cn(agentType?.tint, flow.isArchived && "opacity-50 grayscale")}
        />
        <div className="flex min-w-0 flex-1 flex-col gap-0.5">
          {isExternal ? (
            <a href={href} {...linkProps}>
              {name}
            </a>
          ) : (
            <NavLink to={href} {...linkProps}>
              {name}
            </NavLink>
          )}
          <span className="flex items-center gap-1.5 whitespace-nowrap text-xs text-muted-foreground">
            {agentType?.label ?? getFlowTypeLabel(String(flow.type))}
            <span className="font-mono tabular-nums">v{flow.versionNumber}</span>
            {flow.isArchived ? (
              <span className="inline-flex items-center gap-1">
                <ArchiveIcon className="size-3" />
                Archived
              </span>
            ) : (
              flow.isPublished && <AgentPublishedMark />
            )}
          </span>
        </div>
        <div className="-mr-1.5 -mt-1">
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

      <div className="mx-4 mb-4 mt-3">
        <p className="line-clamp-2 min-h-10 text-body-sm text-ink-2" title={flow.description}>
          {flow.description || <span className="text-muted-foreground">No description</span>}
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
        <span className="ml-auto flex min-w-0 items-center gap-2 pl-1.5">
          {folder && <FolderChip folder={folder} />}
          {firstQueue && (
            <NavLink
              to={getQueueUrl(firstQueue.id, firstQueue.name, firstQueue.type)}
              draggable={false}
              title={flow.queues?.map((queue) => queue.name).join(", ")}
              className={cn(
                META_CLASS_NAME,
                "rounded-sm outline-none hover:text-ink focus-visible:ring-2 focus-visible:ring-focus",
              )}
            >
              <ListChecksIcon className="size-3.5 shrink-0" />
              <span className="truncate">{firstQueue.name}</span>
              {otherQueues.length > 0 && <span className="shrink-0">+{otherQueues.length}</span>}
            </NavLink>
          )}
        </span>
      </div>
    </div>
  );
};

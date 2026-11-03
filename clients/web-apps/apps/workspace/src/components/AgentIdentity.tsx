import { cn } from "@avplatform/ui/lib";
import { formatDate } from "@avplatform/ui/utils";
import { formatDistanceToNow } from "date-fns";

import { AgentAvatar } from "@/components/AgentAvatar";
import { AGENT_TYPES } from "@/features/01-build/flows-table/constants/agent-attributes.constant";

/** Link style of an agent name; add `text-ink`, or `text-muted-foreground` for an inactive agent. */
export const AGENT_NAME_LINK_CLASS =
  "min-w-0 truncate rounded-sm font-semibold outline-none transition-colors hover:text-primary-text focus-visible:ring-2 focus-visible:ring-focus";

type AgentTypeAvatarProps = {
  type?: string;
  isMuted?: boolean;
};

/**
 * Agent tile with the icon and tint of its type.
 */
export const AgentTypeAvatar = ({ type, isMuted }: AgentTypeAvatarProps) => {
  const agentType = AGENT_TYPES.find((option) => option.value === type);

  return (
    <AgentAvatar
      size="sm"
      Icon={agentType?.icon}
      className={cn("size-[30px] rounded-md", agentType?.tint, isMuted && "opacity-50 grayscale")}
    />
  );
};

type AgentVersionProps = {
  versionNumber?: number;
  lastModifiedOn?: Date | string;
};

/**
 * Agent version number, with its last update time on hover.
 */
export const AgentVersion = ({ versionNumber, lastModifiedOn }: AgentVersionProps) => (
  <span
    className="shrink-0 font-mono text-[11.5px] tabular-nums text-muted-foreground"
    title={
      lastModifiedOn
        ? `Updated ${formatDistanceToNow(lastModifiedOn, { addSuffix: true })} (${formatDate(lastModifiedOn, true)})`
        : undefined
    }
  >
    v{versionNumber}
  </span>
);

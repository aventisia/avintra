import { Badge } from "@avplatform/ui/badge";
import { cn } from "@avplatform/ui/lib";
import { MetaLine } from "@avplatform/ui/meta-line";
import { ArrowUUpLeftIcon, TrashIcon } from "@phosphor-icons/react";

import { AgentAvatar } from "@/components/AgentAvatar";

import type { ResourceFlowDraft } from "../../../hooks/useResourceFlowDraft.hook";
import type { FlowAccessAgent, FlowAccessChange } from "../../../types/flow-access.type";
import { getAgentKindLabel, getAgentMeta } from "../../../utils/agent-display.util";

type AllowListRowProps = {
  agent: FlowAccessAgent;
  change: FlowAccessChange;
  draft: ResourceFlowDraft;
};

/**
 * One allow-list entry with its pending add/remove state.
 */
export const AllowListRow = ({ agent, change, draft }: AllowListRowProps) => {
  const meta = getAgentMeta(agent);
  const isRemoved = change === "removed";

  return (
    <div
      className={cn(
        "group flex items-center gap-3 px-3.5 py-2.5 transition-colors",
        isRemoved ? "bg-sunken" : "hover:bg-hover",
      )}
    >
      <AgentAvatar size="lg" className={cn("transition", isRemoved && "opacity-40 grayscale")} />
      <div className="min-w-0 flex-1">
        <div className="flex items-center gap-2">
          <p
            className={cn(
              "truncate text-[13.5px] font-medium text-ink",
              isRemoved && "text-muted-foreground line-through decoration-line-strong",
            )}
          >
            {agent.name}
          </p>
          {change === "added" && <Badge className="shrink-0">New</Badge>}
          {isRemoved && (
            <Badge variant="destructive" className="shrink-0">
              Removing
            </Badge>
          )}
        </div>
        <MetaLine
          className="mt-0.5 text-[12px] text-muted-foreground"
          items={[
            getAgentKindLabel(agent.type),
            meta.versions,
            meta.modified && <span title={meta.modifiedTitle ?? undefined}>{meta.modified}</span>,
          ]}
        />
      </div>
      {isRemoved ? (
        <button
          type="button"
          onClick={() => draft.add(agent)}
          className="inline-flex h-7 shrink-0 items-center gap-1 rounded-md bg-surface px-2 text-[12px] font-medium text-ink-2 ring-1 ring-line-strong transition hover:text-ink hover:ring-line-strong"
        >
          <ArrowUUpLeftIcon className="size-3.5" />
          Undo
        </button>
      ) : (
        <button
          type="button"
          aria-label={`Remove ${agent.name}`}
          title={`Remove ${agent.name}`}
          onClick={() => draft.remove(agent.id)}
          className="grid size-7 shrink-0 place-items-center rounded-md text-muted-foreground opacity-0 transition hover:bg-bad/10 hover:text-bad focus-visible:opacity-100 group-hover:opacity-100 [@media(hover:none)]:opacity-100"
        >
          <TrashIcon className="size-4" />
        </button>
      )}
    </div>
  );
};

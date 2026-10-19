import { cn } from "@avplatform/ui/lib";
import { Undo2, X } from "lucide-react";

import type { ResourceFlowDraft } from "../../../hooks/useResourceFlowDraft.hook";
import type { FlowAccessAgent, FlowAccessChange } from "../../../types/flow-access.type";
import { getAgentKindLabel, getAgentMeta } from "../../../utils/agent-display.util";
import { AgentAvatar } from "./AgentAvatar";
import { MetaLine } from "./MetaLine";

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
        isRemoved ? "bg-slate-50/80" : "hover:bg-slate-50/70",
      )}
    >
      <AgentAvatar size="lg" className={cn("transition", isRemoved && "opacity-40 grayscale")} />
      <div className="min-w-0 flex-1">
        <div className="flex items-center gap-2">
          <p
            className={cn(
              "truncate text-[13.5px] font-medium text-slate-900",
              isRemoved && "text-slate-400 line-through decoration-slate-300",
            )}
          >
            {agent.name}
          </p>
          {change === "added" && (
            <span className="shrink-0 rounded-full bg-emerald-50 px-1.5 py-px text-[10.5px] font-semibold text-emerald-700 ring-1 ring-emerald-600/15">
              New
            </span>
          )}
          {isRemoved && (
            <span className="shrink-0 rounded-full bg-rose-50 px-1.5 py-px text-[10.5px] font-semibold text-rose-600 ring-1 ring-rose-600/15">
              Removing
            </span>
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
          className="inline-flex h-7 shrink-0 items-center gap-1 rounded-lg bg-popover px-2 text-[12px] font-medium text-slate-600 ring-1 ring-border transition hover:text-slate-900 hover:ring-slate-300"
        >
          <Undo2 className="size-3.5" />
          Undo
        </button>
      ) : (
        <button
          type="button"
          aria-label={`Remove ${agent.name}`}
          title={`Remove ${agent.name}`}
          onClick={() => draft.remove(agent.id)}
          className="grid size-7 shrink-0 place-items-center rounded-lg text-slate-400 opacity-0 transition hover:bg-rose-50 hover:text-rose-600 focus-visible:opacity-100 group-hover:opacity-100 [@media(hover:none)]:opacity-100"
        >
          <X className="size-4" />
        </button>
      )}
    </div>
  );
};

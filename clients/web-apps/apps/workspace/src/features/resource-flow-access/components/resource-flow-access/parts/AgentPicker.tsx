import { cn } from "@avplatform/ui/lib";
import { Check, LoaderCircle } from "lucide-react";
import { useState } from "react";

import { AgentAvatar } from "@/components/AgentAvatar";
import { HighlightedText } from "@/components/HighlightedText";
import { Kbd } from "@/components/Kbd";
import { MetaLine } from "@/components/MetaLine";

import { PickerShell } from "../../../../resource-access-shared/components/PickerShell";
import type { ResourceFlowDraft } from "../../../hooks/useResourceFlowDraft.hook";
import { useSearchAssignableFlows } from "../../../hooks/useSearchAssignableFlows.hook";
import { getAgentKindLabel, getAgentMeta } from "../../../utils/agent-display.util";

/**
 * Search combobox for picking the agents on the restricted allow-list.
 */
export const AgentPicker = ({ draft }: { draft: ResourceFlowDraft }) => {
  const [query, setQuery] = useState("");
  const [isOpen, setIsOpen] = useState(false);

  const { results, debouncedQuery, isLoading, isError, isSearching } = useSearchAssignableFlows(
    query,
    {
      enabled: isOpen,
    },
  );

  return (
    <PickerShell
      isOpen={isOpen}
      onOpenChange={setIsOpen}
      query={query}
      onQueryChange={setQuery}
      isFetching={isSearching}
      inputLabel="Search agents"
      placeholder="Search agents to allow…"
      listLabel="Agents"
      header={
        <div className="flex items-center justify-between px-3.5 pb-1.5 pt-3">
          <span className="text-[11px] font-semibold uppercase tracking-[0.08em] text-slate-400">
            {debouncedQuery ? "Matching agents" : "Recently created"}
          </span>
          {isSearching && <LoaderCircle className="size-3.5 animate-spin text-slate-400" />}
        </div>
      }
      options={results.map((agent) => {
        const isSelected = draft.isSelected(agent.id);
        const isDisabled = !isSelected && draft.isAtLimit;
        const meta = getAgentMeta(agent);

        return {
          key: agent.id,
          isSelected,
          isDisabled,
          className: isDisabled ? "cursor-not-allowed opacity-50" : undefined,
          onPick: () => draft.toggle(agent),
          content: (
            <>
              <AgentAvatar size="md" />
              <span className="min-w-0 flex-1">
                <span className="block truncate text-[13px] font-medium text-slate-800">
                  <HighlightedText text={agent.name} query={debouncedQuery} />
                </span>
                <MetaLine
                  className="mt-0.5 text-[11.5px] text-muted-foreground"
                  items={[
                    getAgentKindLabel(agent.type),
                    meta.versions,
                    meta.modified && (
                      <span title={meta.modifiedTitle ?? undefined}>{meta.modified}</span>
                    ),
                  ]}
                />
              </span>
              <span
                className={cn(
                  "grid size-[18px] shrink-0 place-items-center rounded-[5px] transition-colors",
                  isSelected
                    ? "bg-primary text-white"
                    : "bg-popover text-transparent shadow-[inset_0_0_0_1.5px_rgb(203,213,225)]",
                )}
              >
                <Check className="size-3" strokeWidth={3.5} />
              </span>
            </>
          ),
        };
      })}
      empty={
        isLoading ? (
          <>
            {Array.from({ length: 4 }, (_, index) => (
              <li key={index} className="flex animate-pulse items-center gap-3 px-2 py-2">
                <span className="size-8 rounded-[10px] bg-muted" />
                <span className="flex-1 space-y-1.5">
                  <span className="block h-3 w-2/5 rounded bg-muted" />
                  <span className="block h-2.5 w-1/4 rounded bg-muted" />
                </span>
              </li>
            ))}
          </>
        ) : isError ? (
          <li className="px-3 py-8 text-center text-[13px] text-rose-600">
            Couldn’t load agents. Try again in a moment.
          </li>
        ) : (
          <li className="px-3 py-8 text-center">
            <p className="text-[13px] font-medium text-slate-700">
              {debouncedQuery ? `No agents match “${debouncedQuery}”` : "No agents yet"}
            </p>
            <p className="mt-1 text-[12px] text-muted-foreground">
              Only agents you own or collaborate on are listed.
            </p>
          </li>
        )
      }
      footer={
        <>
          <span className="flex items-center gap-1">
            <Kbd>↑</Kbd>
            <Kbd>↓</Kbd>
            move
          </span>
          <span className="flex items-center gap-1">
            <Kbd>↵</Kbd>
            toggle
          </span>
          <span className="flex items-center gap-1">
            <Kbd>esc</Kbd>
            close
          </span>
          <span className="ml-auto tabular-nums">{draft.selectedIds.length} selected</span>
        </>
      }
    />
  );
};

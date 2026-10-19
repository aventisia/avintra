import { cn } from "@avplatform/ui/lib";
import { Check, LoaderCircle, Search } from "lucide-react";
import { Popover } from "radix-ui";
import { type KeyboardEvent, useCallback, useEffect, useId, useRef, useState } from "react";

import type { ResourceFlowDraft } from "../../../hooks/useResourceFlowDraft.hook";
import { useSearchAssignableFlows } from "../../../hooks/useSearchAssignableFlows.hook";
import type { FlowAccessAgent } from "../../../types/flow-access.type";
import { getAgentKindLabel, getAgentMeta } from "../../../utils/agent-display.util";
import { AgentAvatar } from "./AgentAvatar";
import { HighlightedText } from "./HighlightedText";
import { Kbd } from "./Kbd";
import { MetaLine } from "./MetaLine";

/**
 * Search combobox for picking the agents on the restricted allow-list.
 */
export const AgentPicker = ({ draft }: { draft: ResourceFlowDraft }) => {
  const [query, setQuery] = useState("");
  const [isOpen, setIsOpen] = useState(false);
  const [activeIndex, setActiveIndex] = useState(0);
  const anchorRef = useRef<HTMLDivElement>(null);
  const listId = useId();

  const { results, debouncedQuery, isLoading, isError, isSearching } = useSearchAssignableFlows(
    query,
    {
      enabled: isOpen,
    },
  );
  const safeIndex = results.length > 0 ? Math.min(activeIndex, results.length - 1) : -1;
  const optionId = useCallback((index: number) => `${listId}-option-${index}`, [listId]);

  useEffect(() => {
    if (isOpen && safeIndex >= 0) {
      document.getElementById(optionId(safeIndex))?.scrollIntoView({ block: "nearest" });
    }
  }, [isOpen, optionId, safeIndex]);

  const pick = (agent: FlowAccessAgent) => {
    if (!draft.isSelected(agent.id) && draft.isAtLimit) return;
    draft.toggle(agent);
  };

  const handleKeyDown = (event: KeyboardEvent<HTMLInputElement>) => {
    if (event.key === "ArrowDown" || event.key === "ArrowUp") {
      event.preventDefault();
      if (!isOpen) {
        setIsOpen(true);
        return;
      }
      if (results.length === 0) return;
      const step = event.key === "ArrowDown" ? 1 : -1;
      setActiveIndex((safeIndex + step + results.length) % results.length);
    } else if (event.key === "Enter" && isOpen && safeIndex >= 0) {
      event.preventDefault();
      pick(results[safeIndex]);
    }
  };

  return (
    <Popover.Root open={isOpen} onOpenChange={setIsOpen}>
      <Popover.Anchor asChild>
        <div
          ref={anchorRef}
          className="relative flex h-11 items-center rounded-xl bg-popover shadow-[0_1px_2px_rgba(15,23,42,0.04)] ring-1 ring-border transition-shadow focus-within:shadow-[0_0_0_4px_rgba(99,102,241,0.12)] focus-within:ring-indigo-500"
        >
          <Search className="pointer-events-none absolute left-3.5 size-4 text-slate-400" />
          <input
            data-autofocus
            role="combobox"
            aria-expanded={isOpen}
            aria-controls={listId}
            aria-autocomplete="list"
            aria-activedescendant={isOpen && safeIndex >= 0 ? optionId(safeIndex) : undefined}
            aria-label="Search agents"
            value={query}
            onChange={(event) => {
              setQuery(event.target.value);
              setActiveIndex(0);
              setIsOpen(true);
            }}
            onClick={() => setIsOpen(true)}
            onKeyDown={handleKeyDown}
            placeholder="Search agents to allow…"
            className="h-full w-full bg-transparent pl-10 pr-12 text-[13.5px] text-slate-900 outline-none placeholder:text-slate-400"
          />
          <span className="pointer-events-none absolute right-3 flex items-center text-slate-400">
            {isOpen && isSearching ? (
              <LoaderCircle className="size-4 animate-spin" />
            ) : (
              <Kbd>↓</Kbd>
            )}
          </span>
        </div>
      </Popover.Anchor>

      <Popover.Portal>
        <Popover.Content
          side="bottom"
          align="start"
          sideOffset={8}
          onOpenAutoFocus={(event) => event.preventDefault()}
          onCloseAutoFocus={(event) => event.preventDefault()}
          // IMPORTANT NOTE: Radix dialog scroll lock swallows wheel events on portaled popover content.
          onWheel={(event) => event.stopPropagation()}
          onInteractOutside={(event) => {
            if (anchorRef.current?.contains(event.target as Node)) event.preventDefault();
          }}
          className="z-50 w-[var(--radix-popover-trigger-width)] overflow-hidden rounded-xl bg-popover shadow-[0_20px_50px_-12px_rgba(15,23,42,0.35)] ring-1 ring-slate-900/[0.08] data-[state=closed]:animate-out data-[state=open]:animate-in data-[state=closed]:fade-out-0 data-[state=open]:fade-in-0 data-[state=open]:slide-in-from-top-1"
        >
          <div className="flex items-center justify-between px-3.5 pb-1.5 pt-3">
            <span className="text-[11px] font-semibold uppercase tracking-[0.08em] text-slate-400">
              {debouncedQuery ? "Matching agents" : "Recently created"}
            </span>
            {isSearching && <LoaderCircle className="size-3.5 animate-spin text-slate-400" />}
          </div>

          <ul
            id={listId}
            role="listbox"
            aria-multiselectable="true"
            aria-label="Agents"
            className="max-h-[17rem] overflow-y-auto overscroll-contain px-1.5 pb-1.5"
          >
            {isLoading ? (
              Array.from({ length: 4 }, (_, index) => (
                <li key={index} className="flex animate-pulse items-center gap-3 px-2 py-2">
                  <span className="size-8 rounded-[10px] bg-muted" />
                  <span className="flex-1 space-y-1.5">
                    <span className="block h-3 w-2/5 rounded bg-muted" />
                    <span className="block h-2.5 w-1/4 rounded bg-muted" />
                  </span>
                </li>
              ))
            ) : isError ? (
              <li className="px-3 py-8 text-center text-[13px] text-rose-600">
                Couldn’t load agents. Try again in a moment.
              </li>
            ) : results.length === 0 ? (
              <li className="px-3 py-8 text-center">
                <p className="text-[13px] font-medium text-slate-700">
                  {debouncedQuery ? `No agents match “${debouncedQuery}”` : "No agents yet"}
                </p>
                <p className="mt-1 text-[12px] text-muted-foreground">
                  Only agents you own or collaborate on are listed.
                </p>
              </li>
            ) : (
              results.map((agent, index) => {
                const isSelected = draft.isSelected(agent.id);
                const isDisabled = !isSelected && draft.isAtLimit;
                const meta = getAgentMeta(agent);
                return (
                  <li
                    key={agent.id}
                    id={optionId(index)}
                    role="option"
                    aria-selected={isSelected}
                    aria-disabled={isDisabled}
                    onPointerMove={() => setActiveIndex(index)}
                    onMouseDown={(event) => event.preventDefault()}
                    onClick={() => pick(agent)}
                    className={cn(
                      "flex cursor-pointer select-none items-center gap-3 rounded-lg px-2 py-2 transition-colors",
                      index === safeIndex && "bg-muted/80",
                      isDisabled && "cursor-not-allowed opacity-50",
                    )}
                  >
                    <AgentAvatar size="md" />
                    <span className="min-w-0 flex-1">
                      <span className="block truncate text-[13px] font-medium text-slate-800">
                        <HighlightedText
                          text={agent.name}
                          query={debouncedQuery}
                          markClassName="text-primary"
                        />
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
                  </li>
                );
              })
            )}
          </ul>

          <div className="flex items-center gap-3 border-t border-slate-100 bg-slate-50/70 px-3.5 py-2 text-[11px] text-muted-foreground">
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
          </div>
        </Popover.Content>
      </Popover.Portal>
    </Popover.Root>
  );
};

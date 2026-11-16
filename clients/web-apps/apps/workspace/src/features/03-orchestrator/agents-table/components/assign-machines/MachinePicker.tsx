import { HighlightedText } from "@avplatform/ui/highlighted-text";
import { useDebounce } from "@avplatform/ui/hooks/useDebounce";
import { cn } from "@avplatform/ui/lib";
import { CheckIcon, CircleNotchIcon } from "@phosphor-icons/react";
import { useState } from "react";

import { Kbd } from "@/components/Kbd";
import { PickerShell } from "@/features/resource-access-shared/components/PickerShell";

import type { MachineAssignmentDraft } from "../../hooks/useMachineAssignmentDraft.hook";
import { useSearchMachinesList } from "../../hooks/useSearchMachinesList";
import { MachineMark } from "./MachineMark";

/**
 * Search combobox for picking the machines assigned to an agent version.
 */
export const MachinePicker = ({ draft }: { draft: MachineAssignmentDraft }) => {
  const [query, setQuery] = useState("");
  const [isOpen, setIsOpen] = useState(false);
  const trimmedQuery = query.trim();
  const debouncedQuery = useDebounce(trimmedQuery, 250);
  const { data, isLoading, isFetching, isError } = useSearchMachinesList(debouncedQuery);
  const results = debouncedQuery ? (data?.data ?? []) : [];
  const isSearching = isFetching || trimmedQuery !== debouncedQuery;

  return (
    <PickerShell
      isOpen={isOpen}
      onOpenChange={setIsOpen}
      query={query}
      onQueryChange={setQuery}
      isFetching={isSearching}
      inputLabel="Search machines"
      placeholder="Search machines to assign…"
      listLabel="Machines"
      header={
        <div className="flex items-center justify-between px-3.5 pb-1.5 pt-3">
          <span className="text-[11px] font-semibold uppercase tracking-[0.08em] text-muted-foreground">
            Matching machines
          </span>
          {isSearching && (
            <CircleNotchIcon className="size-3.5 animate-spin text-muted-foreground" />
          )}
        </div>
      }
      options={results.map((machine) => {
        const isSelected = draft.isSelected(machine.id);

        return {
          key: machine.id,
          isSelected,
          onPick: () => draft.toggle(machine),
          content: (
            <>
              <MachineMark os={machine.type} size="md" />
              <span className="min-w-0 flex-1">
                <span className="block truncate text-[13px] font-medium text-ink">
                  <HighlightedText text={machine.name} query={debouncedQuery} />
                </span>
                {machine.status && (
                  <span className="mt-0.5 block text-[11.5px] text-muted-foreground">
                    {machine.status}
                  </span>
                )}
              </span>
              <span
                className={cn(
                  "grid size-[18px] shrink-0 place-items-center rounded-sm transition-colors",
                  isSelected
                    ? "bg-primary text-primary-foreground"
                    : "bg-surface text-transparent ring-[1.5px] ring-inset ring-line-strong",
                )}
              >
                <CheckIcon className="size-3" weight="bold" />
              </span>
            </>
          ),
        };
      })}
      empty={
        !debouncedQuery ? (
          <li className="px-3 py-8 text-center text-[13px] text-muted-foreground">
            Type a machine name to search.
          </li>
        ) : isLoading ? (
          <>
            {Array.from({ length: 3 }, (_, index) => (
              <li key={index} className="flex animate-pulse items-center gap-3 px-2 py-2">
                <span className="size-8 rounded-md bg-muted" />
                <span className="flex-1 space-y-1.5">
                  <span className="block h-3 w-2/5 rounded bg-muted" />
                  <span className="block h-2.5 w-1/4 rounded bg-muted" />
                </span>
              </li>
            ))}
          </>
        ) : isError ? (
          <li className="px-3 py-8 text-center text-[13px] text-bad">
            Couldn’t load machines. Try again in a moment.
          </li>
        ) : (
          <li className="px-3 py-8 text-center text-[13px] font-medium text-ink-2">
            No machines match “{debouncedQuery}”
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
          <span className="ml-auto font-mono tabular-nums">
            {draft.selectedIds.length} assigned
          </span>
        </>
      }
    />
  );
};

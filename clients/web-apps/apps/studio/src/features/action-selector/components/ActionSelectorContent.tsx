import { Button } from "@avplatform/ui/buttons";
import { MagnifyingGlassIcon, XIcon } from "@phosphor-icons/react";
import { KeyboardEvent, useEffect, useMemo, useRef } from "react";
import { useHotkeys } from "react-hotkeys-hook";
import { useShallow } from "zustand/react/shallow";

import { useNodeSelectorStore } from "@/features/action-selector/stores/action-selector-store";

import { countActions } from "../utils/count-actions.util";
import { ActionCategoryList } from "./ActionCategoryList";
import { PrimaryCategoryList } from "./PrimaryCategoryList";

export const ActionSelectorContent = () => {
  const {
    origin,
    primaryCategoryLabel,
    setQuery,
    query,
    setPrimaryCategoryLabel,
    actionSelectorData,
    setShowDialog,
  } = useNodeSelectorStore(
    useShallow((state) => ({
      origin: state.origin,
      primaryCategoryLabel: state.primaryCategoryLabel,
      query: state.query,
      setQuery: state.setQuery,
      setPrimaryCategoryLabel: state.setPrimaryCategoryLabel,
      actionSelectorData: state.actionSelectorData,
      setShowDialog: state.setShowDialog,
    })),
  );

  const totalActions = useMemo(
    () => countActions(actionSelectorData.flatMap((primary) => primary.actionCategories)),
    [actionSelectorData],
  );

  const inputRef = useRef<HTMLInputElement>(null);
  const firstItemRef = useRef<HTMLButtonElement | null>(null);

  useEffect(() => {
    return () => {
      setQuery("");
      setPrimaryCategoryLabel(null);
    };
  }, [setQuery, setPrimaryCategoryLabel]);

  useHotkeys("ctrl+k, cmd+k, slash", (e) => {
    e.preventDefault();
    if (inputRef.current) inputRef.current.focus();
  });

  const isOriginReplaceTrigger = origin === "ReplaceTrigger";

  const handleInputKeyDown = (e: KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "ArrowDown") {
      e.preventDefault();
      firstItemRef.current?.focus();
    }
  };

  return (
    <div className="flex h-full flex-col bg-surface text-ink">
      <div className="flex shrink-0 items-center gap-2 pb-1 pl-4 pr-2 pt-3">
        <div className="min-w-0 flex-1">
          <h2 className="text-[16px]/5 font-semibold tracking-[-0.01em]">Add step</h2>
          <p className="mt-0.5 text-[12.5px]/[18px] text-muted-foreground">
            Choose what this step does in your flow
          </p>
        </div>
        <Button
          variant="ghost"
          size="icon7"
          aria-label="Close"
          onClick={() => setShowDialog(false)}
          className="self-start"
        >
          <XIcon className="size-4" />
        </Button>
      </div>

      <div className="shrink-0 px-3 pb-3 pt-2">
        <label className="group/search flex h-10 items-center gap-2.5 rounded-lg bg-sunken px-3 ring-1 ring-line transition-[background-color,box-shadow] focus-within:bg-surface focus-within:shadow-focus focus-within:ring-primary/50 hover:ring-line-strong">
          <MagnifyingGlassIcon
            aria-hidden="true"
            className="size-4 shrink-0 text-muted-foreground transition-colors group-focus-within/search:text-primary-text"
          />
          <input
            ref={inputRef}
            type="search"
            name="query"
            aria-label="Search actions"
            className="h-full min-w-0 flex-1 bg-transparent text-[13.5px] text-ink outline-none placeholder:text-muted-foreground [&::-webkit-search-cancel-button]:hidden"
            placeholder={`Search ${totalActions} actions`}
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            onKeyDown={handleInputKeyDown}
            autoFocus
          />
          {query ? (
            <button
              type="button"
              aria-label="Clear search"
              onClick={() => {
                setQuery("");
                inputRef.current?.focus();
              }}
              className="grid size-5 shrink-0 place-items-center rounded-full bg-fill text-muted-foreground outline-none transition-colors hover:bg-line-strong hover:text-ink focus-visible:shadow-focus"
            >
              <XIcon className="size-3" />
            </button>
          ) : (
            <kbd className="pointer-events-none grid h-5 min-w-5 shrink-0 place-items-center rounded border border-line bg-surface px-1 font-mono text-[11px] font-medium leading-none text-muted-foreground shadow-[0_1px_0_var(--line)]">
              /
            </kbd>
          )}
        </label>
      </div>

      <div className="min-h-0 flex-1 overflow-hidden">
        {isOriginReplaceTrigger || query || primaryCategoryLabel ? (
          <ActionCategoryList inputRef={inputRef} firstItemRef={firstItemRef} />
        ) : (
          <PrimaryCategoryList inputRef={inputRef} firstItemRef={firstItemRef} />
        )}
      </div>
    </div>
  );
};

import { Input } from "@avplatform/ui";
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
    <div className="flex h-[calc(100vh-var(--header-height)-4*var(--header-padding))] flex-col rounded-lg bg-surface text-ink">
      <div className="flex h-12 shrink-0 items-center gap-2 border-b border-line pl-4 pr-2">
        <h2 className="min-w-0 flex-1 text-[16px]/5 font-semibold tracking-[-0.01em]">Add step</h2>
        <Button
          variant="ghost"
          size="icon7"
          aria-label="Close"
          onClick={() => setShowDialog(false)}
        >
          <XIcon className="size-4" />
        </Button>
      </div>

      <div className="relative flex shrink-0 items-center border-b border-line p-3">
        <MagnifyingGlassIcon className="pointer-events-none absolute left-[22px] size-4 text-muted-foreground" />
        <Input
          ref={inputRef}
          type="search"
          name="query"
          aria-label="Search actions"
          className="h-control-sm pl-[33px] pr-[34px] text-[13.5px]"
          placeholder={`Search ${totalActions} actions`}
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          onKeyDown={handleInputKeyDown}
          autoFocus
        />
        {!query && (
          <kbd className="pointer-events-none absolute right-[19px] grid h-[18px] min-w-[18px] place-items-center rounded-sm border border-line bg-fill px-1 font-mono text-[11px] font-medium leading-none text-muted-foreground">
            /
          </kbd>
        )}
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

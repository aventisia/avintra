import { useNodeSelectorStore } from "@/features/action-selector/stores/action-selector-store";

import { Input } from "@aventisia/ui";
import { Search } from "lucide-react";
import { KeyboardEvent, useEffect, useRef } from "react";
import { useHotkeys } from "react-hotkeys-hook";
import { useShallow } from "zustand/react/shallow";

import { ActionCategoryList } from "./ActionCategoryList";
import { PrimaryCategoryList } from "./PrimaryCategoryList";

export const ActionSelectorContent = () => {
  const {
    origin,
    primaryCategoryLabel,
    setQuery,
    query,
    setPrimaryCategoryLabel,
  } = useNodeSelectorStore(
    useShallow((state) => ({
      origin: state.origin,
      primaryCategoryLabel: state.primaryCategoryLabel,
      query: state.query,
      setQuery: state.setQuery,
      setPrimaryCategoryLabel: state.setPrimaryCategoryLabel,
    })),
  );

  const inputRef = useRef<HTMLInputElement>(null);
  const firstItemRef = useRef<HTMLButtonElement | null>(null);

  useEffect(() => {
    return () => {
      setQuery("");
      setPrimaryCategoryLabel(null);
    };
  }, [setQuery, setPrimaryCategoryLabel]);

  useHotkeys("ctrl+k, cmd+k", (e) => {
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
    <div className="flex h-[calc(100vh-var(--header-height)-4*var(--header-padding))] flex-col rounded-lg bg-background">
      <div className="flex shrink-0 items-center border-b px-3 pt-1">
        <Search className="mr-2 h-4 w-4 opacity-50" />

        <Input
          ref={inputRef}
          name="query"
          className="border-none px-0 pr-1.5 shadow-none placeholder:text-xs focus-visible:ring-0"
          placeholder="Search nodes..."
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          onKeyDown={handleInputKeyDown}
          autoFocus
        />

        <div className="pointer-events-none inline-flex h-5 items-center gap-1 rounded-md bg-muted px-1.5 text-xs text-muted-foreground">
          ⌘K
        </div>
      </div>

      <div className="min-h-0 flex-1 overflow-hidden">
        {isOriginReplaceTrigger || query || primaryCategoryLabel ? (
          <ActionCategoryList inputRef={inputRef} firstItemRef={firstItemRef} />
        ) : (
          <PrimaryCategoryList
            inputRef={inputRef}
            firstItemRef={firstItemRef}
          />
        )}
      </div>
    </div>
  );
};

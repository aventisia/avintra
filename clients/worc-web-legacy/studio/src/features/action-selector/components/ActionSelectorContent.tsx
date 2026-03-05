import { useNodeSelectorStore } from "@/features/action-selector/stores/action-selector-store";
import { Command } from "@aventisia/ui/command";
import { useRef } from "react";
import { useHotkeys } from "react-hotkeys-hook";
import { useShallow } from "zustand/react/shallow";
import { NoActionsMessage } from "./NoActionsMessage";
import { PrimaryCategoryList } from "./PrimaryCategoryList";
import { ActionCategoryList } from "./ActionCategoryList";
import { ArrowLeftIcon, Search } from "lucide-react";
import { Input } from "@aventisia/ui";
import { Button } from "@aventisia/ui/buttons";

export const ActionSelectorContent = () => {
  // Get the origin and originId from the store
  const { origin, primaryCategoryLabel, setQuery, query } =
    useNodeSelectorStore(
      useShallow((state) => ({
        origin: state.origin,
        primaryCategoryLabel: state.primaryCategoryLabel,
        query: state.query,
        setQuery: state.setQuery,
      })),
    );

  // Ref for command input
  const inputRef = useRef<HTMLInputElement>(null);

  // Focus on search input on ctrl+k
  useHotkeys("ctrl+k", (e) => {
    e.preventDefault();
    if (inputRef.current) inputRef.current.focus();
  });

  // Is used to render the list of triggers
  const isOriginReplaceTrigger = origin === "ReplaceTrigger";

  return (
    <>
      {/*  Search Header */}
      <div
        className="flex items-center border-b px-3 pt-1"
        cmdk-input-wrapper=""
      >
        {query ? (
          <Button
            variant="ghost"
            size="icon8"
            className="m-0 mr-2 h-4 w-4 p-0"
            onClick={() => setQuery("")}
          >
            <ArrowLeftIcon className="h-4 w-4 opacity-50" />
          </Button>
        ) : (
          <Search className="mr-2 h-4 w-4 opacity-50" />
        )}

        <Input
          ref={inputRef}
          name="query"
          className="border-none px-0 pr-1.5 placeholder:text-xs focus-visible:ring-0"
          placeholder="Search..."
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          autoFocus
        />

        <div className="pointer-events-none inline-flex h-5 items-center gap-1 rounded-md bg-muted px-1.5 text-xs text-muted-foreground">
          ⌘K
        </div>
      </div>

      <Command className="h-[calc(100vh-3.5rem-var(--header-height)-var(--header-padding))] overflow-hidden">
        {/* No content message */}
        <NoActionsMessage />

        {isOriginReplaceTrigger || query ? (
          // Contains the list of all triggers
          <ActionCategoryList />
        ) : // Contains the list of all primary categories
        !primaryCategoryLabel ? (
          <PrimaryCategoryList />
        ) : (
          <ActionCategoryList />
        )}
      </Command>
    </>
  );
};

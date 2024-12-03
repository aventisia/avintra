import { useNodeSelectorStore } from "@/features/action-selector/stores/action-selector-store";
import { Command, CommandInput } from "@/react-toolkit/ui/command";
import { ScrollArea } from "@/react-toolkit/ui/scroll-area";
import { useRef } from "react";
import { useHotkeys } from "react-hotkeys-hook";
import { useShallow } from "zustand/react/shallow";
import { NoActionsMessage } from "./NoActionsMessage";
import { PrimaryCategoryList } from "./PrimaryCategoryList";
import { ActionCategoryList } from "./ActionCategoryList";

export const ActionSelectorContent = () => {
  // Get the origin and originId from the store
  const { origin, primaryCategoryLabel } = useNodeSelectorStore(
    useShallow((state) => ({
      origin: state.origin,
      primaryCategoryLabel: state.primaryCategoryLabel,
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
    <Command>
      {/* Searchbox */}
      <CommandInput
        ref={inputRef}
        className="text-xs"
        placeholder="Search..."
      />

      {/* No content message */}
      <NoActionsMessage />

      {/* List of Nodes */}
      <ScrollArea className="p-2">
        {isOriginReplaceTrigger ? (
          // Contains the list of all triggers
          <ActionCategoryList />
        ) : (
          // Contains the list of all primary categories
          <>
            {!primaryCategoryLabel ? (
              <PrimaryCategoryList />
            ) : (
              <ActionCategoryList />
            )}
          </>
        )}
      </ScrollArea>
    </Command>
  );
};

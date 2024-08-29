import { triggersList } from "@/data/triggers-list";
import { cn } from "@/react-toolkit/lib/utils";
import {
  Command,
  CommandEmpty,
  CommandInput,
} from "@/react-toolkit/ui/command";
import { ScrollArea } from "@/react-toolkit/ui/scroll-area";
import { Tabs } from "@/react-toolkit/ui/tabs";
import { useNodeSelectorStore } from "@/stores/node-selector-store";
import { useRef } from "react";
import { useHotkeys } from "react-hotkeys-hook";
import { useShallow } from "zustand/react/shallow";
import { NSCNoContentMessage } from "./NSCNoContentMessage";
import { NSCNodesList } from "./NSCNodesList";
import { NSCTabsContent } from "./NSCTabsContent";
import { NSCTabsList } from "./NSCTabsList";

export const NodeSelectorContent = () => {
  // Get the origin and originId from the store
  const { origin } = useNodeSelectorStore(
    useShallow((state) => ({
      origin: state.origin,
    })),
  );

  // Ref for command input
  const inputRef = useRef<HTMLInputElement>(null);

  // Focus on search input on ctrl+k
  useHotkeys("ctrl+k", (e) => {
    e.preventDefault();
    if (inputRef.current) inputRef.current.focus();
  });

  // Focus on search input on tab change
  const onTabChange = () => {
    if (inputRef.current) {
      setTimeout(() => {
        inputRef.current?.focus();
      }, 0);
    }
  };

  // Is used to render the list of triggers
  const isOriginReplaceTrigger = origin === "ReplaceTrigger";

  return (
    <Tabs
      defaultValue="all"
      onValueChange={onTabChange}
      className={cn("h-full", !isOriginReplaceTrigger && "pb-9")}
    >
      <Command>
        {/* Searchbox */}
        <CommandInput
          ref={inputRef}
          className="text-xs"
          placeholder="Search..."
        />

        {/* No content message */}
        <CommandEmpty className="h-full">
          <NSCNoContentMessage />
        </CommandEmpty>

        {/* List of Nodes */}
        <ScrollArea className="p-2">
          {isOriginReplaceTrigger ? (
            // Contains the list of all triggers
            <NSCNodesList nodesList={triggersList} />
          ) : (
            // Contains the list of all tabs content
            <NSCTabsContent />
          )}
        </ScrollArea>
      </Command>

      {/* Contains list of all Tabs */}
      {!isOriginReplaceTrigger && <NSCTabsList />}
    </Tabs>
  );
};

import {
  Command,
  CommandEmpty,
  CommandInput,
} from "@/react-toolkit/ui/command";
import { ScrollArea } from "@/react-toolkit/ui/scroll-area";
import { Tabs } from "@/react-toolkit/ui/tabs";
import { NodeSelectorOriginType } from "@/types/node-selector-origin-type";
import { useRef } from "react";
import { useHotkeys } from "react-hotkeys-hook";
import { NSCNoContentMessage } from "./NSCNoContentMessage";
import { NSCTabsContent } from "./NSCTabsContent";
import { NSCTabsList } from "./NSCTabsList";
import { NSCTriggersList } from "./NSCTriggersList";

interface NodeSelectorContentProps {
  origin: NodeSelectorOriginType;
  originId: string;
}

export const NodeSelectorContent = ({
  origin,
  originId,
}: NodeSelectorContentProps) => {
  // Ref for command input
  const inputRef = useRef<HTMLInputElement>(null);

  // Focus on search input on ctrl+k
  useHotkeys("ctrl+k", (e) => {
    e.preventDefault();
    if (inputRef.current) inputRef.current.focus();
  });

  return (
    <Tabs defaultValue="all" className="h-full pb-9">
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
          {origin === "ReplaceTrigger" ? (
            // Contains the list of all triggers
            <NSCTriggersList />
          ) : (
            // Contains the list of all tabs content
            <NSCTabsContent origin={origin} originId={originId} />
          )}
        </ScrollArea>
      </Command>

      {/* Contains list of all Tabs */}
      <NSCTabsList />
    </Tabs>
  );
};

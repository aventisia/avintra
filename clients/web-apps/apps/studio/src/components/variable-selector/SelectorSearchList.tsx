import { Command, CommandEmpty, CommandInput, CommandList } from "@avplatform/ui/command";
import { ScrollArea } from "@avplatform/ui/scroll";
import type { Icon } from "@phosphor-icons/react";

import { VariableItem } from "./VariableItem";

type SelectorSearchListProps = {
  items: string[];
  isConfigValue?: boolean;
  ItemIcon: Icon;
  placeholder: string;
  emptyTitle: string;
  emptyHint: string;
};

/**
 * Searchable list of variable or key store names that inserts the picked one into the active field.
 */
export const SelectorSearchList = ({
  items,
  isConfigValue = false,
  ItemIcon,
  placeholder,
  emptyTitle,
  emptyHint,
}: SelectorSearchListProps) => (
  <Command className="flex min-h-0 flex-1 flex-col bg-transparent">
    <div className="px-2 pt-2">
      <div className="rounded-md bg-sunken ring-1 ring-line transition-shadow focus-within:ring-2 focus-within:ring-focus [&_[cmdk-input-wrapper]]:px-2.5">
        <CommandInput className="h-8 text-[12.5px]" placeholder={placeholder} autoFocus />
      </div>
    </div>

    <CommandEmpty className="px-4 py-8 text-center">
      <span className="mx-auto mb-2 grid size-8 place-items-center rounded-md bg-sunken text-ink-2 ring-1 ring-line">
        <ItemIcon className="size-4" />
      </span>
      <p className="text-[13px] font-medium text-ink-2">
        {items.length === 0 ? emptyTitle : "No matches"}
      </p>
      <p className="mt-0.5 text-[12px] text-muted-foreground">
        {items.length === 0 ? emptyHint : "Try a different search term."}
      </p>
    </CommandEmpty>

    <ScrollArea className="min-h-0 flex-1" viewportClassName="max-h-72">
      <CommandList className="p-1.5">
        {items.map((item) => (
          <VariableItem key={item} value={item} isConfigValue={isConfigValue} Icon={ItemIcon} />
        ))}
      </CommandList>
    </ScrollArea>
  </Command>
);

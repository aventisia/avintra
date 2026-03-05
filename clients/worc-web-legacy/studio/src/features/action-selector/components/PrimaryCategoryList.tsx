import { CommandItem } from "@aventisia/ui/command";
import { PrimaryCategory } from "./PrimaryCategory";
import { useNodeSelectorStore } from "../stores/action-selector-store";
import { useShallow } from "zustand/react/shallow";
import { ScrollArea } from "@aventisia/ui/scroll";

export const PrimaryCategoryList = () => {
  // Get the setPrimaryCategory function from the store
  const { actionSelectorData, setPrimaryCategoryLabel } = useNodeSelectorStore(
    useShallow((state) => ({
      actionSelectorData: state.actionSelectorData,
      setPrimaryCategoryLabel: state.setPrimaryCategoryLabel,
    })),
  );

  // Return the primary category list
  return (
    <ScrollArea className="h-full p-2">
      <div className="grid grid-cols-2 gap-y-1">
        {actionSelectorData.map((item) => (
          <CommandItem
            key={item.label}
            value={item.label}
            onSelect={() => setPrimaryCategoryLabel(item.label)}
            className="aria-selected:bg-transparent"
          >
            <PrimaryCategory data={item} />
          </CommandItem>
        ))}
      </div>
    </ScrollArea>
  );
};

import { CommandItem, CommandList } from "@/react-toolkit/ui/command";
import { Separator } from "@/react-toolkit/ui/separator";
import { PrimaryCategory } from "./PrimaryCategory";
import { actionSelectorData } from "../constants/action-selector-data";
import { useNodeSelectorStore } from "../stores/action-selector-store";
import { useShallow } from "zustand/react/shallow";

export const PrimaryCategoryList = () => {
  // Get the setPrimaryCategory function from the store
  const { setPrimaryCategoryLabel } = useNodeSelectorStore(
    useShallow((state) => ({
      setPrimaryCategoryLabel: state.setPrimaryCategoryLabel,
    })),
  );

  // Return the primary category list
  return (
    <CommandList>
      {actionSelectorData.map((item, index) => (
        <div key={item.name}>
          <CommandItem
            value={item.label}
            className="rounded-lg p-1"
            onSelect={() => setPrimaryCategoryLabel(item.label)}
          >
            {/* Primary category item */}
            <PrimaryCategory data={item} />
          </CommandItem>

          {/* Separator */}
          {index < actionSelectorData.length - 1 && (
            <div className="flex justify-center">
              <Separator
                orientation="horizontal"
                className="h-[0.5px] w-[90%]"
              />
            </div>
          )}
        </div>
      ))}
    </CommandList>
  );
};

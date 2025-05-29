import { CommandGroup, CommandItem, CommandList } from "@aventisia/ui/command";
import { Separator } from "@aventisia/ui";
import { PrimaryCategory } from "./PrimaryCategory";
import { useNodeSelectorStore } from "../stores/action-selector-store";
import { useShallow } from "zustand/react/shallow";
import { useCurrentFlowStore } from "@/stores/current-flow-store";

export const PrimaryCategoryList = () => {
  // Get the setPrimaryCategory function from the store
  const { actionSelectorData, setPrimaryCategoryLabel } = useNodeSelectorStore(
    useShallow((state) => ({
      actionSelectorData: state.actionSelectorData,
      setPrimaryCategoryLabel: state.setPrimaryCategoryLabel,
    })),
  );

  const { projectInfo } = useCurrentFlowStore(
    useShallow((state) => ({
      projectInfo: state.projectInfo,
    })),
  );

  // Return the primary category list
  return (
    <CommandList>
      <CommandGroup>
        {actionSelectorData.map((item, index) => (
          <div key={item.label}>
            <CommandItem
              value={item.label}
              className="rounded-lg p-1"
              onSelect={() => setPrimaryCategoryLabel(item.label)}
              // disabled={!item.actionCategories.length}
              disabled={
                projectInfo?.type === "AutomationAgent" &&
                item.label === "AI Integrations" &&
                true
              }
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
      </CommandGroup>
    </CommandList>
  );
};
